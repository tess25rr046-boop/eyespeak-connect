import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { COMMUNICATION_OPTIONS } from "../lib/communication";
import type { GestureKind } from "../lib/gestures";
import { RadialMenu } from "../components/RadialMenu";
import { MessageDisplay } from "../components/MessageDisplay";
import { HelpAlertDemo } from "../components/HelpAlertDemo";
import { StatusIndicator } from "../components/StatusIndicator";

export const Route = createFileRoute("/communicate")({
  head: () => ({
    meta: [
      { title: "Communication — NeuroGesture" },
      { name: "description", content: "Gesture-driven accessible communication menu for expressing needs like water, food, pain, or help." },
      { property: "og:title", content: "Communication — NeuroGesture" },
      { property: "og:description", content: "Gesture-driven accessible communication menu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunicatePage,
});

const gestureLabels: Record<GestureKind, string> = {
  none: "None detected",
  "blink-left": "Left blink",
  "blink-right": "Right blink",
  "blink-both": "Both eyes blink",
  "look-left": "Look left",
  "look-right": "Look right",
  "look-up": "Look up",
  "look-down": "Look down",
  smile: "Smile",
  "eyebrow-raise": "Eyebrow raise",
};

function CommunicatePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
  const [showHelpDemo, setShowHelpDemo] = useState(false);

  // Gesture state comes from the detector once MediaPipe is wired in.
  // Until then it honestly reports that no detector is running.
  const [detectedGesture] = useState<GestureKind>("none");
  const [detectorRunning] = useState(false);

  function handleConfirm(id: string) {
    const opt = COMMUNICATION_OPTIONS.find((o) => o.id === id);
    if (!opt) return;
    if (id === "help") {
      setShowHelpDemo(true);
    }
    setConfirmedMessage(opt.message);
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Neuro</span>Gesture
        </Link>
        <span className="text-lg font-medium text-muted-foreground">Step 2 of 2 — Communicate</span>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 lg:grid-cols-[1fr_360px]">
        <section aria-labelledby="menu-heading">
          <h1 id="menu-heading" className="text-3xl font-bold">
            What would you like to say?
          </h1>
          <div className="mt-6">
            <RadialMenu
              options={COMMUNICATION_OPTIONS}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setConfirmedMessage(null);
              }}
              onConfirm={handleConfirm}
            />
          </div>
          <div className="mt-8">
            <MessageDisplay
              message={confirmedMessage}
              confirmed={confirmedMessage !== null}
            />
          </div>
        </section>

        {/* Status sidebar */}
        <aside aria-label="System status" className="space-y-4 lg:pt-16">
          <h2 className="text-xl font-bold">System status</h2>
          <StatusIndicator
            label="Selected option"
            value={
              selectedId
                ? COMMUNICATION_OPTIONS.find((o) => o.id === selectedId)?.label ?? "—"
                : "None"
            }
            tone={selectedId ? "active" : "neutral"}
          />
          <StatusIndicator
            label="Detected gesture"
            value={gestureLabels[detectedGesture]}
            tone={detectedGesture !== "none" ? "active" : "neutral"}
          />
          <StatusIndicator
            label="Gesture detector"
            value={detectorRunning ? "Running" : "Not connected yet"}
            tone={detectorRunning ? "active" : "warning"}
          />
          <p className="rounded-2xl bg-muted p-4 text-base text-muted-foreground">
            This panel will update live once MediaPipe gesture detection is connected.
            No detection results are simulated.
          </p>
          <button
            onClick={() => setShowHelpDemo(true)}
            className="w-full rounded-2xl border-2 border-urgent/40 bg-card px-6 py-4 text-lg font-bold text-urgent hover:bg-urgent/10"
          >
            Preview help alert (demo)
          </button>
        </aside>
      </main>

      {showHelpDemo && <HelpAlertDemo onClose={() => setShowHelpDemo(false)} />}
    </div>
  );
}
