/** Large-text message area with confirmation feedback. */
export function MessageDisplay({
  message,
  confirmed,
}: {
  message: string | null;
  confirmed: boolean;
}) {
  return (
    <section
      aria-live="polite"
      className={`rounded-3xl border-2 p-8 text-center transition-colors ${
        confirmed ? "border-success bg-success/10" : "border-border bg-card"
      }`}
    >
      {message ? (
        <>
          <p className="text-3xl font-bold leading-snug md:text-4xl">{message}</p>
          {confirmed && (
            <p className="mt-4 flex items-center justify-center gap-2 text-xl font-semibold text-success">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Message confirmed
            </p>
          )}
        </>
      ) : (
        <p className="text-2xl font-medium text-muted-foreground">
          Your selected message will appear here
        </p>
      )}
    </section>
  );
}
