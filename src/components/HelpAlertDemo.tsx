/**
 * Prototype help-alert screen.
 * Purely a visual demonstration of what a caregiver alert could look like.
 * It sends nothing and contacts no one.
 */
export function HelpAlertDemo({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="help-alert-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-6"
    >
      <div className="w-full max-w-2xl rounded-3xl border-4 border-urgent bg-card p-10 text-center shadow-2xl">
        <p className="inline-block rounded-full bg-warning/15 px-4 py-1 text-sm font-bold uppercase tracking-wide text-warning-foreground">
          Prototype simulation — no real alert is sent
        </p>
        <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-urgent text-urgent-foreground">
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h2 id="help-alert-title" className="mt-6 text-4xl font-bold text-urgent">
          Help Requested
        </h2>
        <p className="mt-4 text-xl leading-relaxed text-card-foreground">
          In a finished system, this is where an alert would appear on the caregiver's
          device: the patient's name, room, and the time help was requested.
        </p>
        <div className="mt-6 rounded-2xl bg-muted p-5 text-left text-lg">
          <p><span className="font-semibold">Patient:</span> Demo User</p>
          <p><span className="font-semibold">Request:</span> Help</p>
          <p>
            <span className="font-semibold">Time:</span>{" "}
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          onClick={onClose}
          autoFocus
          className="mt-8 rounded-2xl bg-primary px-10 py-4 text-xl font-bold text-primary-foreground hover:bg-primary/90"
        >
          Close demonstration
        </button>
      </div>
    </div>
  );
}
