# EyeSpeak Connect

Create a web application called "NeuroGesture".

This is a student hackathon prototype for low-cost assistive communication using intentional eye and facial gestures through a laptop webcam.

IMPORTANT:

- Build this as a browser-based web application.

- The primary target device is a laptop with a built-in webcam.

- Use React and TypeScript.

- Keep the architecture simple and modular so webcam/MediaPipe functionality can be added and tested separately.

- Do not create a fake AI demo or simulated gesture detection.

- The actual webcam and MediaPipe integration will be implemented in the application.

Create these pages/components:

1. Landing page

- NeuroGesture logo/name

- Short tagline: "Communicate without touching."

- Brief explanation of the concept

- "Start Communication" button

- "How it works" section

2. Camera setup page

- Camera permission status

- Large webcam preview area

- Start Camera button

- Stop Camera button

- Camera status indicator

- Face detection status indicator

3. Communication page

- Large accessible interface

- Radial-style communication menu

- Options:

  Water

  Food

  Pain

  Help

  Call Caregiver

  Adjust Bed

  Bathroom

  Yes

  No

  Message

- Clearly show the currently selected option

- Show the currently detected gesture

- Show system status

4. Message area

- Display the selected communication message in large text

- Provide clear confirmation feedback

5. Help/Emergency demonstration

- Create a clearly labelled prototype/simulation alert screen.

- Do not claim that it sends a real emergency alert.

- Show what an alert could look like when the user selects Help.

Design:

- Clean professional healthcare-accessibility style

- Large text

- High contrast

- Minimal clutter

- Rounded accessible controls

- Responsive laptop layout

- Clear visual feedback

- Avoid excessive animations

Create reusable components and keep webcam processing, gesture detection, and UI state logically separated.

For now, focus on creating the complete UI and application structure. Do not invent webcam detection results.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0dd6c625-0afc-4a0f-920d-5a9bb228f85d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
