# NeuroGesture

NeuroGesture is a browser-based assistive communication application for people who may have difficulty using conventional input. It uses a normal laptop webcam, MediaPipe Face Landmarker, and the Web Speech API to turn intentional eye movements and blinks into communication.

## What works

- Real webcam access with `getUserMedia` — no special hardware.
- Real MediaPipe Face Landmarker processing in the browser.
- Iris-position based left/right/up/down gaze detection.
- Deliberate blink detection using an open → closed → open cycle and cooldown.
- Debounced direction changes so tiny movements do not constantly change the selection.
- Radial communication menu for Water, Food, Pain, Help, Call Caregiver, Adjust Bed, Bathroom, Yes, No, and Message.
- Blink-to-select with spoken output through `SpeechSynthesis`.
- Voice ON/OFF control.
- Live System Status and expandable Detection Details for hackathon judging.
- Clearly labelled Demo Mode for manual fallback. Demo Mode never reports simulated detection as real computer vision.
- Keyboard fallback: arrow keys navigate and Enter/Space selects.
- Friendly camera/model failure handling.

## How it works

`Laptop webcam → Face Landmarker → eye/iris landmarks → gaze direction → menu navigation → blink → selected message → speech`

MediaPipe is initialized with `FilesetResolver.forVisionTasks()` and `FaceLandmarker.createFromOptions()` in `src/lib/gestures.ts`. The landmarker runs in VIDEO mode and receives the live `<video>` element. The app uses face landmarks around both eyes and iris landmarks to estimate gaze direction. A blink is recognized only after the eyes transition from open to closed and back to open, with a selection cooldown.

MediaPipe Tasks processes input on-device; the current implementation does not upload camera frames to an application backend. See the MediaPipe privacy notice for the SDK's own metrics/privacy details.

## Project structure

```text
src/
  components/          Reusable UI components
  hooks/               Existing app hooks
  lib/
    gestures.ts        Real MediaPipe + gaze/blink detection
    communication.ts   Communication menu data
    camera.ts           Existing camera helpers
  routes/
    index.tsx          Landing page
    setup.tsx          Camera setup and MediaPipe readiness
    communicate.tsx    Live communication UI
    __root.tsx         Global app shell/styles
  neurogesture.css     NeuroGesture-specific responsive UI
```

## Install and run

Requires Node.js and npm (or Bun if preferred by your local environment).

```bash
npm install
npm run dev
```

Open the local Vite URL in a browser that supports webcam access. For deployment, camera access must be served from a secure context such as HTTPS (localhost is also treated as secure by browsers).

## First-time camera setup

1. Open **Start Communication**.
2. Choose **Start Camera**.
3. Allow camera permission when the browser asks.
4. Wait for **MediaPipe: Connected** and **Face: Detected**.
5. Continue to the communication screen.
6. Look deliberately in a direction to move the highlighted option.
7. Blink once deliberately (open → closed → open) to select it.
8. The selected message is displayed and spoken when Voice is ON.

If the camera is denied or unavailable, Live Mode reports the problem instead of inventing a face or gesture result. Demo Mode is available for a presentation fallback.

## Hackathon demo (5 minutes)

**0:00–0:45 — Problem**
Explain that some users cannot reliably use a keyboard, touchscreen, or speech, while a laptop webcam is widely available.

**0:45–1:30 — Concept**
Show the flow: webcam → facial landmarks → gaze direction → menu → blink → speech.

**1:30–2:30 — Live setup**
Allow camera access and show the live Face/MediaPipe status becoming connected.

**2:30–4:15 — Live communication**
Look toward a menu direction and show the highlight move. Blink to select **Water**, **Pain**, or **Help**. Demonstrate the spoken message and the live status panel. Open Detection Details to show that the values come from the detector.

**4:15–5:00 — Reliability and fallback**
Explain the smoothing/cooldown logic, privacy model, keyboard fallback, and clearly labelled Demo Mode for unreliable hackathon camera environments.

## Technologies

- React + TypeScript
- TanStack Start / Vite
- `@mediapipe/tasks-vision` 1.0.1
- MediaPipe Face Landmarker
- Browser MediaDevices / `getUserMedia`
- Web Speech API / `SpeechSynthesis`
- Modern CSS
- GitHub

The MediaPipe package is currently published as version 1.0.1; Google's current web documentation shows the same `FilesetResolver` + `FaceLandmarker.createFromOptions` setup pattern.

## Important limitations

This is an assistive-technology prototype, not a medical device or emergency-response service. Camera-based gaze estimation is sensitive to lighting, camera position, glasses, head movement, and individual eye anatomy. **Help** and **Pain** are only local communication messages; the application does not contact emergency services or a caregiver automatically.
