import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuroGesture — Communicate without touching" },
      {
        name: "description",
        content:
          "NeuroGesture is a low-cost assistive communication prototype that turns intentional eye and facial gestures into speech-free messages using a laptop webcam.",
      },
      { property: "og:title", content: "NeuroGesture — Communicate without touching" },
      {
        property: "og:description",
        content:
          "Low-cost assistive communication through intentional eye and facial gestures, using just a laptop webcam.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

function Logo({ size = "text-3xl" }: { size?: string }) {
  return (
    <span className={`font-bold tracking-tight ${size}`}>
      <span className="text-primary">Neuro</span>
      <span className="text-foreground">Gesture</span>
    </span>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Logo />
        <Link
          to="/setup"
          className="rounded-2xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground hover:bg-primary/90"
        >
          Start Communication
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="py-16 text-center md:py-24">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            Communicate without touching.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
            NeuroGesture is a student-built assistive communication prototype. It uses an
            ordinary laptop webcam to recognise intentional eye and facial gestures — like
            a blink or a glance — and turns them into clear messages for caregivers.
          </p>
          <Link
            to="/setup"
            className="mt-10 inline-block rounded-2xl bg-primary px-12 py-5 text-2xl font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            Start Communication
          </Link>
          <p className="mt-4 text-base text-muted-foreground">
            Uses your webcam only. No account, no installation.
          </p>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-it-works" className="pb-24">
          <h2 id="how-it-works" className="text-center text-3xl font-bold md:text-4xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "1. Set up your camera",
                body: "Allow webcam access and position yourself so your face is clearly visible in the preview.",
              },
              {
                title: "2. Make intentional gestures",
                body: "Look toward an option on the communication menu and confirm with a deliberate gesture such as a long blink.",
              },
              {
                title: "3. Your message is shown",
                body: "The selected need — water, help, pain and more — appears in large, clear text your caregiver can read at a glance.",
              },
            ].map((step) => (
              <li key={step.title} className="rounded-3xl border-2 border-border bg-card p-8">
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 rounded-2xl bg-accent p-5 text-center text-lg font-medium text-accent-foreground">
            Hackathon prototype: gesture recognition runs fully in the browser with
            MediaPipe. Nothing is uploaded or recorded.
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-base text-muted-foreground">
        NeuroGesture — a student hackathon prototype for low-cost assistive communication.
      </footer>
    </div>
  );
}
