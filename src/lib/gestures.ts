/**
 * Gesture detection layer (MediaPipe integration point).
 *
 * This module defines the contract between webcam frames and the UI.
 * The real MediaPipe FaceLandmarker implementation will be added here;
 * the UI already consumes these types so nothing downstream changes.
 */

export type GestureKind =
  | "none"
  | "blink-left"
  | "blink-right"
  | "blink-both"
  | "look-left"
  | "look-right"
  | "look-up"
  | "look-down"
  | "smile"
  | "eyebrow-raise";

export interface GestureFrame {
  gesture: GestureKind;
  confidence: number; // 0..1
  timestamp: number;
}

export interface FaceDetectionStatus {
  facePresent: boolean;
  landmarksReady: boolean;
}

export interface GestureDetector {
  /** Attach to a live video element. Call once per camera start. */
  attach(video: HTMLVideoElement): Promise<void>;
  /** Latest detection status; polled or pushed to UI. */
  status(): FaceDetectionStatus;
  /** Subscribe to gesture frames. Returns an unsubscribe function. */
  onGesture(cb: (frame: GestureFrame) => void): () => void;
  /** Release model + resources. Call when the camera stops. */
  dispose(): void;
}

/**
 * Placeholder detector. Reports honest "no face / not ready" status and
 * emits no gestures until the MediaPipe model is wired in. Keeps the app
 * real — nothing is simulated here.
 */
export function createPendingDetector(): GestureDetector {
  const listeners = new Set<(frame: GestureFrame) => void>();
  return {
    async attach() {
      // TODO: load MediaPipe FaceLandmarker WASM + model here.
    },
    status() {
      return { facePresent: false, landmarksReady: false };
    },
    onGesture(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    dispose() {
      listeners.clear();
    },
  };
}
