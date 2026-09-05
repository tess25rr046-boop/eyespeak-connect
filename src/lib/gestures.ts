import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export type GestureKind =
  | "none" | "blink-left" | "blink-right" | "blink-both"
  | "look-left" | "look-right" | "look-up" | "look-down";

export interface GestureFrame { gesture: GestureKind; confidence: number; timestamp: number; }
export interface FaceDetectionStatus { facePresent: boolean; landmarksReady: boolean; error?: string; }

export interface GestureDetector {
  attach(video: HTMLVideoElement): Promise<void>;
  status(): FaceDetectionStatus;
  onGesture(cb: (frame: GestureFrame) => void): () => void;
  onStatus(cb: (status: FaceDetectionStatus) => void): () => void;
  dispose(): void;
}

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const LEFT_EYE = { outer: 33, inner: 133, upper: 159, lower: 145, iris: 468 };
const RIGHT_EYE = { outer: 362, inner: 263, upper: 386, lower: 374, iris: 473 };

function distance(a: { x: number; y: number }, b: { x: number; y: number }) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function eyeAspectRatio(lm: FaceLandmarkerResult["faceLandmarks"][number], eye: typeof LEFT_EYE) {
  const horizontal = distance(lm[eye.outer], lm[eye.inner]);
  return horizontal ? distance(lm[eye.upper], lm[eye.lower]) / horizontal : 0;
}
function irisRatio(lm: FaceLandmarkerResult["faceLandmarks"][number], eye: typeof LEFT_EYE) {
  const p = lm[eye.iris], left = lm[eye.outer], right = lm[eye.inner];
  const top = Math.min(lm[eye.upper].y, lm[eye.lower].y), bottom = Math.max(lm[eye.upper].y, lm[eye.lower].y);
  return {
    x: (p.x - Math.min(left.x, right.x)) / Math.max(0.0001, Math.abs(right.x - left.x)),
    y: (p.y - top) / Math.max(0.0001, bottom - top),
  };
}

export class MediaPipeGestureDetector implements GestureDetector {
  private landmarker: FaceLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private animationFrame = 0;
  private lastVideoTime = -1;
  private lastEmit = 0;
  private lastDirection: GestureKind = "none";
  private blinkState: "open" | "closed" = "open";
  private lastBlink = 0;
  private currentStatus: FaceDetectionStatus = { facePresent: false, landmarksReady: false };
  private listeners = new Set<(frame: GestureFrame) => void>();
  private statusListeners = new Set<(status: FaceDetectionStatus) => void>();

  async attach(video: HTMLVideoElement) {
    this.video = video;
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    const common = { runningMode: "VIDEO" as const, numFaces: 1, minFaceDetectionConfidence: 0.5, minFacePresenceConfidence: 0.5, minTrackingConfidence: 0.5 };
    try {
      this.landmarker = await FaceLandmarker.createFromOptions(vision, { ...common, baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" } });
    } catch {
      this.landmarker = await FaceLandmarker.createFromOptions(vision, { ...common, baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" } });
    }
    this.setStatus({ facePresent: false, landmarksReady: true });
    this.loop();
  }

  status() { return this.currentStatus; }
  onGesture(cb: (frame: GestureFrame) => void) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  onStatus(cb: (status: FaceDetectionStatus) => void) { this.statusListeners.add(cb); cb(this.currentStatus); return () => this.statusListeners.delete(cb); }
  private setStatus(next: FaceDetectionStatus) {
    if (next.facePresent === this.currentStatus.facePresent && next.landmarksReady === this.currentStatus.landmarksReady && next.error === this.currentStatus.error) return;
    this.currentStatus = next; this.statusListeners.forEach((cb) => cb(next));
  }
  private emit(gesture: GestureKind, confidence: number, timestamp: number) {
    if (timestamp - this.lastEmit < 260 && gesture !== "blink-both") return;
    this.lastEmit = timestamp; this.lastDirection = gesture;
    this.listeners.forEach((cb) => cb({ gesture, confidence, timestamp }));
  }
  private loop = () => {
    if (!this.video || !this.landmarker) return;
    const video = this.video;
    if (video.readyState >= 2 && video.currentTime !== this.lastVideoTime) {
      const now = performance.now();
      try {
        const result = this.landmarker.detectForVideo(video, now);
        this.lastVideoTime = video.currentTime;
        const lm = result.faceLandmarks[0];
        this.setStatus({ facePresent: Boolean(lm), landmarksReady: true });
        if (lm) {
          const leftBlink = eyeAspectRatio(lm, LEFT_EYE), rightBlink = eyeAspectRatio(lm, RIGHT_EYE);
          const closed = leftBlink < 0.18 && rightBlink < 0.18;
          if (closed && this.blinkState === "open") this.blinkState = "closed";
          else if (!closed && this.blinkState === "closed") {
            this.blinkState = "open";
            if (now - this.lastBlink > 850) { this.lastBlink = now; this.emit("blink-both", 1, now); }
          }
          const leftIris = irisRatio(lm, LEFT_EYE), rightIris = irisRatio(lm, RIGHT_EYE);
          const gazeX = (leftIris.x + rightIris.x) / 2, gazeY = (leftIris.y + rightIris.y) / 2;
          let direction: GestureKind = "none", confidence = 0;
          if (gazeX < 0.36) { direction = "look-left"; confidence = clamp01((0.5 - gazeX) * 2); }
          else if (gazeX > 0.64) { direction = "look-right"; confidence = clamp01((gazeX - 0.5) * 2); }
          else if (gazeY < 0.34) { direction = "look-up"; confidence = clamp01((0.5 - gazeY) * 2); }
          else if (gazeY > 0.66) { direction = "look-down"; confidence = clamp01((gazeY - 0.5) * 2); }
          if (direction !== "none" && direction !== this.lastDirection) this.emit(direction, confidence, now);
          if (direction === "none") this.lastDirection = "none";
        }
      } catch (error) {
        this.setStatus({ facePresent: false, landmarksReady: true, error: error instanceof Error ? error.message : "Detection failed." });
      }
    }
    this.animationFrame = requestAnimationFrame(this.loop);
  };
  dispose() {
    cancelAnimationFrame(this.animationFrame); this.animationFrame = 0; this.landmarker?.close(); this.landmarker = null; this.video = null;
    this.listeners.clear(); this.statusListeners.clear(); this.currentStatus = { facePresent: false, landmarksReady: false };
  }
}
export function createMediaPipeDetector() { return new MediaPipeGestureDetector(); }
