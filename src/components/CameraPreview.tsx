import { forwardRef } from "react";

/**
 * Large webcam preview surface. The parent owns the stream and passes the
 * <video> ref so the camera layer and (later) the gesture detector can
 * attach to the same element.
 */
export const CameraPreview = forwardRef<
  HTMLVideoElement,
  { active: boolean; faceDetected: boolean }
>(function CameraPreview({ active, faceDetected }, ref) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border-2 border-border bg-secondary">
      <video
        ref={ref}
        playsInline
        muted
        className={`h-full w-full -scale-x-100 object-cover ${active ? "" : "invisible"}`}
        aria-label="Webcam preview"
      />
      {!active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <svg
            className="h-16 w-16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-xl font-medium">Camera is off</p>
          <p className="text-base">Press “Start Camera” to begin setup</p>
        </div>
      )}
      {active && faceDetected && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[28%] inset-y-[12%] rounded-3xl border-4 border-success"
        />
      )}
    </div>
  );
});
