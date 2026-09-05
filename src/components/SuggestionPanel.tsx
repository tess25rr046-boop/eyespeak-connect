import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { suggestOptions } from "../lib/ai.functions";
import type { CommunicationOption } from "../lib/communication";

interface Suggestion {
  id: string;
  reason: string;
}

/** AI-assisted prediction of the options the person is most likely to need next. */
export function SuggestionPanel({
  options,
  recent,
  onPick,
}: {
  options: CommunicationOption[];
  recent: string[];
  onPick: (id: string) => void;
}) {
  const run = useServerFn(suggestOptions);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSuggest() {
    setLoading(true);
    setError(null);
    try {
      const hour = new Date().getHours();
      const timeOfDay =
        hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
      const res = await run({
        data: { optionIds: options.map((o) => o.id), recent, timeOfDay },
      });
      setSuggestions(res.suggestions);
      if (res.suggestions.length === 0) setError("No suggestions available right now.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suggestions are unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="suggestions-heading"
      className="rounded-3xl border-2 border-border bg-card p-6"
    >
      <h2 id="suggestions-heading" className="text-xl font-bold">
        Suggested next
      </h2>
      <p className="mt-1 text-base text-muted-foreground">
        AI-assisted guesses based on recent choices. Always confirm with the person.
      </p>
      <button
        onClick={handleSuggest}
        disabled={loading}
        className="mt-4 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "Thinking…" : "Suggest options"}
      </button>

      {error && (
        <p role="alert" className="mt-4 text-base font-medium text-urgent">
          {error}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul className="mt-4 space-y-3">
          {suggestions.map((s) => {
            const opt = options.find((o) => o.id === s.id);
            if (!opt) return null;
            return (
              <li key={s.id}>
                <button
                  onClick={() => onPick(s.id)}
                  className="w-full rounded-2xl border-2 border-border px-5 py-4 text-left hover:bg-muted"
                >
                  <span className="block text-lg font-bold">{opt.label}</span>
                  <span className="block text-base text-muted-foreground">{s.reason}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
