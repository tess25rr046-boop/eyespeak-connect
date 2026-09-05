import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { completePhrase } from "../lib/ai.functions";

/** Free-text message entry with AI phrase completion. */
export function MessageComposer({ onSend }: { onSend: (text: string) => void }) {
  const run = useServerFn(completePhrase);
  const [text, setText] = useState("");
  const [completions, setCompletions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await run({ data: { partial: text.trim().slice(0, 200) } });
      setCompletions(res.completions);
      if (res.completions.length === 0) setError("No completions available right now.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Completions are unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="composer-heading"
      className="rounded-3xl border-2 border-border bg-card p-6"
    >
      <h2 id="composer-heading" className="text-xl font-bold">
        Spell a message
      </h2>
      <label htmlFor="composer-input" className="mt-2 block text-base text-muted-foreground">
        Start typing and AI will offer ways to finish the sentence.
      </label>
      <textarea
        id="composer-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="mt-3 w-full rounded-2xl border-2 border-border bg-background p-4 text-xl"
        placeholder="I would like…"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={handleComplete}
          disabled={loading || !text.trim()}
          className="rounded-2xl border-2 border-border px-6 py-3 text-lg font-bold disabled:opacity-60"
        >
          {loading ? "Thinking…" : "Complete phrase"}
        </button>
        <button
          onClick={() => text.trim() && onSend(text.trim())}
          disabled={!text.trim()}
          className="rounded-2xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground disabled:opacity-60"
        >
          Show message
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-base font-medium text-urgent">
          {error}
        </p>
      )}

      {completions.length > 0 && (
        <ul className="mt-4 space-y-2">
          {completions.map((c) => (
            <li key={c}>
              <button
                onClick={() => {
                  setText(c);
                  setCompletions([]);
                }}
                className="w-full rounded-2xl border-2 border-border px-5 py-3 text-left text-lg hover:bg-muted"
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
