import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createMediaPipeDetector, type FaceDetectionStatus } from "../lib/gestures";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Camera Setup — NeuroGesture" }, { name: "description", content: "Connect your laptop webcam and verify real MediaPipe face tracking." }] }),
  component: SetupPage,
});

function SetupPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef(createMediaPipeDetector());
  const streamRef = useRef<MediaStream | null>(null);
  const [camera, setCamera] = useState<"idle" | "requesting" | "connected" | "denied" | "error">("idle");
  const [status, setStatus] = useState<FaceDetectionStatus>({ facePresent: false, landmarksReady: false });
  const [error, setError] = useState("");

  useEffect(() => {
    const detector = detectorRef.current;
    const off = detector.onStatus(setStatus);
    return () => { off(); detector.dispose(); streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  async function start() {
    if (!videoRef.current || camera === "requesting" || camera === "connected") return;
    setCamera("requesting"); setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not support webcam access.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      await detectorRef.current.attach(videoRef.current);
      setCamera("connected");
    } catch (e) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      const message = e instanceof Error ? e.message : "Unable to access the camera.";
      const denied = /denied|permission|notallowed/i.test(message);
      setError(denied ? "Camera access was denied. Please allow camera access in your browser settings." : message);
      setCamera(denied ? "denied" : "error");
    }
  }

  return <div className="ng-page">
    <header className="ng-header"><Link to="/" className="ng-logo"><span>Neuro</span>Gesture</Link><span className="ng-step">Step 1 of 2 — Camera setup</span></header>
    <main className="ng-container setup-layout">
      <section><div className="eyebrow">LIVE CAMERA MODE</div><h1>Connect your camera</h1><p className="lead">Your laptop webcam is enough. NeuroGesture processes face landmarks directly in your browser.</p>
        <div className="camera-card"><video ref={videoRef} className="setup-video" autoPlay muted playsInline />{camera !== "connected" && <div className="camera-placeholder"><div className="camera-icon">◉</div><strong>{camera === "requesting" ? "Requesting camera access…" : "Camera preview"}</strong><span>Press Start Camera to begin.</span></div>}{camera === "connected" && <div className="camera-badge">● Camera connected</div>}</div>
        {error && <div className="error-box" role="alert">{error}</div>}
        <div className="setup-actions"><button className="primary-btn" onClick={start} disabled={camera === "requesting" || camera === "connected"}>{camera === "requesting" ? "Connecting…" : "Start Camera"}</button><Link className={`primary-btn success-btn ${camera !== "connected" ? "disabled-link" : ""}`} to="/communicate" aria-disabled={camera !== "connected"}>Start Communication →</Link></div>
      </section>
      <aside className="status-stack"><h2>System status</h2><StatusRow label="Camera" value={camera === "connected" ? "Connected" : camera === "requesting" ? "Requesting…" : "Not connected"} ok={camera === "connected"}/><StatusRow label="Face" value={status.facePresent ? "Detected" : camera === "connected" ? "Looking for face…" : "Waiting"} ok={status.facePresent}/><StatusRow label="MediaPipe" value={status.landmarksReady ? "Connected" : "Not connected"} ok={status.landmarksReady}/><div className="info-box"><strong>What happens next?</strong><p>MediaPipe Face Landmarker tracks facial landmarks in real time. Your gaze moves the menu; a deliberate blink selects it.</p></div></aside>
    </main>
  </div>;
}
function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) { return <div className={`status-row ${ok ? "ok" : ""}`}><span><i />{label}</span><strong>{value}</strong></div>; }
