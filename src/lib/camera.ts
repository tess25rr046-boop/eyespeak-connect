/**
 * Webcam access layer.
 * Owns getUserMedia + stream lifecycle only. No UI, no gesture logic here.
 * MediaPipe face-landmarker wiring is added later in gestures.ts.
 */

export type CameraState = "idle" | "requesting" | "active" | "stopped" | "error" | "denied";

export interface CameraHandle {
  stream: MediaStream;
  video: HTMLVideoElement;
  stop: () => void;
}

export async function startCamera(video: HTMLVideoElement): Promise<CameraHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return {
    stream,
    video,
    stop: () => {
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    },
  };
}

/** Maps a getUserMedia failure to a user-facing camera state. */
export function classifyCameraError(err: unknown): CameraState {
  if (
    err instanceof DOMException &&
    (err.name === "NotAllowedError" || err.name === "SecurityError")
  ) {
    return "denied";
  }
  return "error";
}
