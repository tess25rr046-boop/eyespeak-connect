import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { COMMUNICATION_OPTIONS } from "../lib/communication";
import { createMediaPipeDetector, type GestureKind, type FaceDetectionStatus } from "../lib/gestures";

export const Route = createFileRoute("/communicate")({
  head: () => ({ meta: [{ title: "Communication — NeuroGesture" }, { name: "description", content: "Real webcam and MediaPipe gesture-driven assistive communication." }] }),
  component: CommunicatePage,
});

const directionGroups: Record<"look-left" | "look-right" | "look-up" | "look-down", string[]> = {
  "look-up": ["message", "water", "food"], "look-right": ["food", "pain", "help", "call-caregiver"],
  "look-down": ["help", "call-caregiver", "adjust-bed", "bathroom"], "look-left": ["bathroom", "yes", "no", "message"],
};
const gestureLabels: Record<GestureKind, string> = {
  none: "None detected", "blink-left": "Left blink", "blink-right": "Right blink", "blink-both": "Blink — select",
  "look-left": "Looking left", "look-right": "Looking right", "look-up": "Looking up", "look-down": "Looking down",
};

function CommunicatePage() {
  const videoRef = useRef<HTMLVideoElement>(null), detectorRef = useRef(createMediaPipeDetector()), streamRef = useRef<MediaStream | null>(null);
  const [selectedId, setSelectedId] = useState("water"), [detectedGesture, setDetectedGesture] = useState<GestureKind>("none");
  const [status, setStatus] = useState<FaceDetectionStatus>({ facePresent: false, landmarksReady: false });
  const [lastMessage, setLastMessage] = useState(""), [voiceOn, setVoiceOn] = useState(true), [demoMode, setDemoMode] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false), [messageDraft, setMessageDraft] = useState(""), [cameraError, setCameraError] = useState("");
  const selectedIdRef = useRef(selectedId), voiceOnRef = useRef(voiceOn), demoModeRef = useRef(demoMode);
  selectedIdRef.current = selectedId; voiceOnRef.current = voiceOn; demoModeRef.current = demoMode;
  const selected = useMemo(() => COMMUNICATION_OPTIONS.find((o) => o.id === selectedId) ?? COMMUNICATION_OPTIONS[0], [selectedId]);

  useEffect(() => {
    const detector = detectorRef.current;
    const offStatus = detector.onStatus(setStatus);
    const offGesture = detector.onGesture((frame) => {
      setDetectedGesture(frame.gesture);
      if (demoModeRef.current) return;
      if (frame.gesture === "blink-both") selectOption(selectedIdRef.current, true);
      else if (frame.gesture in directionGroups) navigateDirection(frame.gesture as keyof typeof directionGroups);
    });
    startCamera().catch(() => undefined);
    return () => { offStatus(); offGesture(); detector.dispose(); streamRef.current?.getTracks().forEach((t) => t.stop()); window.speechSynthesis?.cancel(); };
    // Detector lifecycle intentionally runs once for this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    if (!videoRef.current || !navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not support webcam access.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream; videoRef.current.srcObject = stream; await videoRef.current.play(); await detectorRef.current.attach(videoRef.current);
    } catch (e) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraError(e instanceof Error ? e.message : "Camera permission was denied or the camera is unavailable.");
    }
  }
  function navigateDirection(direction: keyof typeof directionGroups) {
    const group = directionGroups[direction], current = group.indexOf(selectedIdRef.current), next = current === -1 ? group[0] : group[(current + 1) % group.length];
    setSelectedId(next);
  }
  function selectOption(id: string, speak = false) {
    const option = COMMUNICATION_OPTIONS.find((o) => o.id === id); if (!option) return;
    setSelectedId(id); if (option.message) setLastMessage(option.message);
    if (speak && option.message && voiceOnRef.current) speakText(option.message);
  }
  function speakText(text: string) { if (!("speechSynthesis" in window) || !text) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.92; window.speechSynthesis.speak(u); }
  function sendCustomMessage() { const text = messageDraft.trim(); if (!text) return; setLastMessage(text); if (voiceOnRef.current) speakText(text); setMessageDraft(""); }
  function handleKeyboard(e: React.KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === "ArrowLeft") navigateDirection("look-left"); if (e.key === "ArrowRight") navigateDirection("look-right");
    if (e.key === "ArrowUp") navigateDirection("look-up"); if (e.key === "ArrowDown") navigateDirection("look-down");
    if (e.key === "Enter" || e.key === " ") selectOption(selectedIdRef.current, true);
  }

  return <div className="ng-page" tabIndex={0} onKeyDown={handleKeyboard}>
    <header className="ng-header"><Link to="/" className="ng-logo"><span>Neuro</span>Gesture</Link><span className="ng-step">Step 2 of 2 — Communicate</span></header>
    <main className="ng-container communicate-layout">
      <section><div className="communication-topline"><div><div className="eyebrow">REAL-TIME ASSISTIVE COMMUNICATION</div><h1>What would you like to say?</h1></div><div className="mode-toggle"><button className={!demoMode ? "active" : ""} onClick={() => setDemoMode(false)}>Live Camera</button><button className={demoMode ? "demo-active" : ""} onClick={() => setDemoMode(true)}>Demo Mode</button></div></div>
        <div className="radial-wrap"><div className="radial-guide" aria-hidden="true"/><div className="radial-center"><span>Selected option</span><strong>{selected.label}</strong><small>{demoMode ? "Demo mode — gestures ignored" : status.facePresent ? gestureLabels[detectedGesture] : "Please position your face in front of the camera"}</small></div>
          {COMMUNICATION_OPTIONS.map((option) => <button key={option.id} className={`radial-option ${selectedId === option.id ? "selected" : ""} ${option.urgent ? "urgent" : ""}`} style={{ "--angle": `${option.angle}deg` } as React.CSSProperties} onClick={() => selectOption(option.id)}>{option.label}</button>)}
        </div>
        {lastMessage && <div className={`message-banner ${selected.urgent ? "urgent-banner" : ""}`}><span>Message</span><strong>{lastMessage}</strong>{selected.urgent && <em>Attention</em>}</div>}
        {selectedId === "message" && <div className="composer"><label htmlFor="custom-message">Custom message</label><div><input id="custom-message" value={messageDraft} onChange={(e) => setMessageDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); sendCustomMessage(); } }} placeholder="Type a message…"/><button className="primary-btn" onClick={sendCustomMessage}>Speak</button></div></div>}
      </section>
      <aside className="status-panel"><h2>SYSTEM STATUS</h2>
        <StatusLine label="Camera" value={cameraError ? "Unavailable" : "Connected"} ok={!cameraError}/><StatusLine label="Face" value={status.facePresent ? "Detected" : "Not detected"} ok={status.facePresent}/><StatusLine label="Gesture detector" value={status.landmarksReady ? "Connected" : "Loading…"} ok={status.landmarksReady}/><StatusLine label="Detected gesture" value={demoMode ? "Demo controls" : gestureLabels[detectedGesture]} ok={detectedGesture !== "none"}/><StatusLine label="Selected option" value={selected.label} ok/><StatusLine label="System" value={status.landmarksReady && status.facePresent ? "READY" : "WAITING"} ok={status.landmarksReady && status.facePresent}/>
        {cameraError && <div className="error-box small" role="alert">Camera access is required for Live Mode. {cameraError}</div>}
        <div className="control-row"><button onClick={() => setVoiceOn((v) => !v)} className="secondary-btn">{voiceOn ? "🔊 Voice ON" : "🔇 Voice OFF"}</button><button onClick={() => setDetailsOpen((v) => !v)} className="secondary-btn">{detailsOpen ? "Hide Details" : "Detection Details"}</button></div>
        {detailsOpen && <div className="details-box"><p>Face detected: <b>{status.facePresent ? "YES" : "NO"}</b></p><p>Current direction: <b>{detectedGesture === "none" ? "NONE" : gestureLabels[detectedGesture].replace("Looking ", "").toUpperCase()}</b></p><p>Blink: <b>{detectedGesture === "blink-both" ? "YES" : "NO"}</b></p><p>Selected option: <b>{selected.label.toUpperCase()}</b></p><p>MediaPipe status: <b>{status.landmarksReady ? "CONNECTED" : "LOADING"}</b></p></div>}
        <div className="mini-camera"><video ref={videoRef} autoPlay muted playsInline/><span>{demoMode ? "DEMO MODE — gestures ignored" : "LIVE CAMERA"}</span></div>
        <button className="alert-demo-btn" onClick={() => { setSelectedId("help"); setLastMessage("I need help."); if (voiceOnRef.current) speakText("I need help."); }}>Preview help alert</button>
      </aside>
    </main>
  </div>;
}
function StatusLine({ label, value, ok }: { label: string; value: string; ok: boolean }) { return <div className={`status-line ${ok ? "ok" : ""}`}><span><i/>{label}</span><strong>{value}</strong></div>; }
