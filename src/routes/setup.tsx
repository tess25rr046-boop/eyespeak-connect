import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { classifyCameraError, startCamera, type CameraHandle, type CameraState } from "../lib/camera";
import { createPendingDetector, type GestureDetector } from "../lib/gestures";
import { CameraPreview } from "../components/CameraPreview";
import { StatusIndicator } from "../components/StatusIndicator";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Camera Setup — NeuroGesture" },
      { name: "description", content: "Enable your webcam and confirm face detection before starting gesture-based communication." },
      { property: "og:title", content: "Camera Setup — NeuroGesture" },
      { property: "og:description", content: "Enable your webcam and confirm face detection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SetupPage,
});

const cameraStatusText: Record<CameraState, string> = {
  idle: "Not started",
  requesting: "Requesting permission…",
  active: "Active",
  stopped: "Stopped",
  error: "Error — no camera found",
  denied: "Permission denied",
};

function SetupPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<CameraHandle | null>(null);
  const detectorRef = useRef<GestureDetector | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [facePresent, setFacePresent] = useState(false);

  useEffect(() => {
    detectorRef.current = createPendingDetector();
    return () => {
      cameraRef.current?.stop();
      detectorRef.current?.dispose();
    };
  }, []);

  async function handleStart() {
    if (!videoRef.current) return;
    setCameraState("requesting");
    try {
      const handle = await startCamera(videoRef.current);
      cameraRef.current = handle;
      await detectorRef.current?.attach(videoRef.current);
      setCameraState("active");
      // MediaPipe not wired yet — honest status: no face detection running.
      setFacePresent(detectorRef.current?.status().facePresent ?? false);
    } catch (err) {
      setCameraState(classifyCameraError(err));
    }
  }

  function handleStop() {
    cameraRef.current?.stop();
    cameraRef.current = null;
    detectorRef.current?.dispose();
    detectorRef.current = createPendingDetector();
    setFacePresent(false);
    setCameraState("stopped");
  }

  const active = cameraState === "active";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Neuro</span>Gesture
        </Link>
        <span className="text-lg font-medium text-muted-foreground">Step 1 of 2 — Camera setup</span>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 pb-16">
        <h1 className="text-4xl font-bold">Camera Setup</h1>

        {/* Status indicators */}
        <div className="flex flex-wrap gap-4">
          <StatusIndicator
            label="Camera"
            value={cameraStatusText[cameraState]}
            tone={active ? "active" : cameraState === "denied" || cameraState === "error" ? "error" : cameraState === "requesting" ? "warning" : "neutral"}
          />
          <StatusIndicator
            label="Face detection"
            value={facePresent ? "Face detected" : active ? "Detector not connected yet" : "Waiting for camera"}
            tone={facePresent ? "active" : active ? "warning" : "neutral"}
          />
        </div>

        {cameraState === "denied" && (
          <p role="alert" className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-5 text-lg font-medium text-destructive">
            Camera permission was denied. Please allow camera access in your browser's
            site settings, then press “Start Camera” again.
          </p>
        )}

        {/* Preview */}
        <CameraPreview ref={videoRef} active={active} faceDetected={facePresent} />

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleStart}
            disabled={active || cameraState === "requesting"}
            className="rounded-2xl bg-primary px-10 py-4 text-xl font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cameraState === "requesting" ? "Requesting…" : "Start Camera"}
          </button>
          <button
            onClick={handleStop}
            disabled={!active}
            className="rounded-2xl border-2 border-border bg-card px-10 py-4 text-xl font-bold text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Stop Camera
          </button>
          <Link
            to="/communicate"
            className={`ml-auto rounded-2xl px-10 py-4 text-xl font-bold ${
              active
                ? "bg-success text-success-foreground hover:bg-success/90"
                : "pointer-events-none bg-muted text-muted-foreground opacity-40"
            }`}
            aria-disabled={!active}
          >
            Continue to Communication →
          </Link>
        </div>

        <p className="text-base text-muted-foreground">
          Gesture detection (MediaPipe face tracking) will attach to this same video
          feed. Until it is connected, the face indicator honestly reports that no
          detector is running — nothing is simulated.
        </p>
      </main>
    </div>
  );
}
