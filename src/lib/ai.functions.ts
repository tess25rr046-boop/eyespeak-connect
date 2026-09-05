import { createServerFn } from "@tanstack/react-start";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, AI_MODEL } from "./ai-gateway.server";

function getModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");
  return createLovableAiGatewayProvider(key)(AI_MODEL);
}

/** 1. Suggest the most likely next communication options for the current context. */
const SuggestInput = z.object({
  optionIds: z.array(z.string()).min(1),
  recent: z.array(z.string()).default([]),
  timeOfDay: z.string().default(""),
});

export const suggestOptions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SuggestInput.parse(input))
  .handler(async ({ data }) => {
    const model = getModel();
    const schema = z.object({
      suggestions: z.array(
        z.object({
          id: z.string(),
          reason: z.string(),
        }),
      ),
    });

    try {
      const result = streamText({
        model,
        output: Output.object({ schema }),
        system:
          "You help a non-verbal patient using an eye-gesture communication board. " +
          "Predict which board options they are most likely to need next. " +
          "Only use ids from the provided list. Return at most 3 suggestions, most likely first. " +
          "Each reason must be a short plain-language phrase under 8 words.",
        prompt:
          `Available option ids: ${data.optionIds.join(", ")}\n` +
          `Recently used ids (most recent last): ${data.recent.length ? data.recent.join(", ") : "none"}\n` +
          `Local time of day: ${data.timeOfDay || "unknown"}`,
      });
      const output = await result.output;
      const allowed = new Set(data.optionIds);
      return {
        suggestions: output.suggestions
          .filter((s) => allowed.has(s.id))
          .slice(0, 3),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) return { suggestions: [] };
      throw error;
    }
  });

/** 2. Expand a short selection into a fuller, natural spoken sentence. */
const ExpandInput = z.object({
  label: z.string().min(1),
  baseMessage: z.string().min(1),
  tone: z.enum(["calm", "urgent", "polite"]).default("polite"),
});

export const expandMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ExpandInput.parse(input))
  .handler(async ({ data }) => {
    const model = getModel();
    const result = streamText({
      model,
      system:
        "You rewrite a patient's communication-board selection as one clear first-person sentence " +
        "a caregiver can read aloud. Keep it under 20 words. No quotes, no extra commentary. " +
        "Never invent medical details, names, or facts the patient did not choose.",
      prompt: `Selection: ${data.label}\nBase message: ${data.baseMessage}\nTone: ${data.tone}`,
    });
    const text = (await result.text).trim();
    return { text: text || data.baseMessage };
  });

/** 3. Phrase completion for the free-text "Message" option. */
const CompleteInput = z.object({
  partial: z.string().min(1).max(200),
});

export const completePhrase = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CompleteInput.parse(input))
  .handler(async ({ data }) => {
    const model = getModel();
    const schema = z.object({ completions: z.array(z.string()) });
    try {
      const result = streamText({
        model,
        output: Output.object({ schema }),
        system:
          "A non-verbal patient is slowly spelling a message. Offer up to 4 short, likely " +
          "completions of their partial text, written in the first person, each under 12 words. " +
          "Stay literal to what they typed; never add medical claims.",
        prompt: `Partial message: "${data.partial}"`,
      });
      const output = await result.output;
      return { completions: output.completions.slice(0, 4) };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) return { completions: [] };
      throw error;
    }
  });
