import Anthropic from "@anthropic-ai/sdk";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "@/db/schema";
import { getQuizAnalysis } from "@/lib/analysis";
import {
  findBlindSpots,
  findHiddenStrengths,
  getPerceptionProfile,
  formatCategory,
} from "@/lib/insights";

const MODEL = "claude-opus-4-8";

export interface NarrativeAction {
  type: "blind_spot" | "hidden_strength";
  category: string;
  advice: string;
}

export interface NarrativeReport {
  paragraphs: string[];
  actions: NarrativeAction[];
}

/** Regenerate once this many new responses have arrived since generation. */
const REGENERATE_AFTER_NEW_RESPONSES = 3;

const OUTPUT_SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  required: ["paragraphs", "actions"],
  properties: {
    paragraphs: {
      type: "array",
      description: "The narrative report, one string per paragraph. 4 to 6 paragraphs.",
      items: { type: "string" },
    },
    actions: {
      type: "array",
      description:
        "One practical 'what to do with this' suggestion per blind spot and hidden strength.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "category", "advice"],
        properties: {
          type: { type: "string", enum: ["blind_spot", "hidden_strength"] },
          category: { type: "string", description: "The trait category this advice is for" },
          advice: { type: "string", description: "2-3 sentences of concrete, doable advice" },
        },
      },
    },
  },
};

function buildPrompt(
  name: string,
  analysis: NonNullable<Awaited<ReturnType<typeof getQuizAnalysis>>>,
  blindSpots: ReturnType<typeof findBlindSpots>,
  hiddenStrengths: ReturnType<typeof findHiddenStrengths>,
  profileLabel: string
): string {
  const traitLines = analysis.questions
    .map(
      (q) =>
        `- ${formatCategory(q.category)} ("${q.textSelf}"): self ${q.selfScore}/5, friends avg ${q.friendsAvg.toFixed(1)}/5`
    )
    .join("\n");

  const blindSpotLines =
    blindSpots.length > 0
      ? blindSpots
          .map((b) => `- ${formatCategory(b.category)}: self ${b.selfScore}/5 vs friends ${b.friendsAvg.toFixed(1)}/5`)
          .join("\n")
      : "(none crossed the 1.5-point threshold)";

  const strengthLines =
    hiddenStrengths.length > 0
      ? hiddenStrengths
          .map((h) => `- ${formatCategory(h.category)}: self ${h.selfScore}/5 vs friends ${h.friendsAvg.toFixed(1)}/5`)
          .join("\n")
      : "(none crossed the 1.5-point threshold)";

  return `Write the premium narrative report for ${name}'s MirrorQuiz results.

MirrorQuiz: people rate themselves on 12 personality traits, then friends rate
them anonymously on the same traits. The product is grounded in the Johari
Window framework (Luft & Ingham) and Simine Vazire's research on self-other
knowledge asymmetry — friends are often *more* accurate than we are about
traits that are observable and evaluative (like humor or charm), while we know
our internal states better.

THE DATA (scores are 1-5):
Overall match between self-image and friends' view: ${analysis.matchPercentage}%
Number of friend responses: ${analysis.responseCount}
Perception profile type: ${profileLabel}

All 12 traits:
${traitLines}

Blind spots (rated self notably higher than friends did):
${blindSpotLines}

Hidden strengths (friends rated notably higher than self):
${strengthLines}

WRITE:
1. "paragraphs": a personal narrative of exactly 4-6 paragraphs addressed to
   ${name} ("you"), in MirrorQuiz's fun, casual, warm voice — like a
   perceptive friend who read the data, not a clinician. Open with the single
   most interesting thing in their results (not a generic greeting). Weave in
   the Johari Window / Vazire science naturally where it illuminates a
   specific gap — one or two light touches, never a lecture. Cover: what the
   overall pattern says about their self-awareness, their most meaningful
   blind spot and hidden strength (if any) and what those gaps tend to mean,
   and end with an encouraging, non-cheesy takeaway. Refer to actual scores
   sparingly — the story matters more than the numbers.
2. "actions": for EACH blind spot and EACH hidden strength listed above, one
   entry with 2-3 sentences of genuinely practical "what to do with this"
   advice — specific behaviors or experiments, not platitudes. Use the exact
   category names given above. If there are no blind spots and no hidden
   strengths, return one entry of each type with advice for maintaining their
   well-calibrated self-image (category: the trait with the largest remaining
   gap).

Do not invent data that isn't above. Do not mention "the data shows" — just
tell them what their friends see.`;
}

/**
 * Returns the narrative report for a quiz, generating (and caching in D1) it
 * when needed. Returns null when no ANTHROPIC_API_KEY is configured and no
 * cached report exists — callers fall back to the rule-based insights.
 *
 * Regenerates when at least REGENERATE_AFTER_NEW_RESPONSES new responses have
 * arrived since the cached report was written; serves the stale cache if
 * regeneration fails.
 */
export async function getOrCreateNarrativeReport(
  quizId: string,
  creatorName: string
): Promise<NarrativeReport | null> {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  const cachedRows = await db
    .select()
    .from(schema.narrativeReports)
    .where(eq(schema.narrativeReports.quizId, quizId))
    .limit(1);
  const cached = cachedRows[0] ?? null;

  const quizRows = await db
    .select({ responseCount: schema.quizzes.responseCount })
    .from(schema.quizzes)
    .where(eq(schema.quizzes.id, quizId))
    .limit(1);
  const currentCount = quizRows[0]?.responseCount ?? 0;

  const cachedReport = cached ? parseReport(cached.content) : null;
  const isFresh =
    cached !== null &&
    currentCount - cached.responseCount < REGENERATE_AFTER_NEW_RESPONSES;

  if (cachedReport && isFresh) return cachedReport;

  if (!env.ANTHROPIC_API_KEY) {
    // No key: serve whatever we have (possibly stale), or signal fallback.
    return cachedReport;
  }

  try {
    const fresh = await generateNarrativeReport(quizId, creatorName);
    return fresh ?? cachedReport;
  } catch (err) {
    console.error("Narrative report generation failed:", err);
    return cachedReport;
  }
}

/** One LLM call over the full self-vs-friends comparison; caches in D1. */
export async function generateNarrativeReport(
  quizId: string,
  creatorName: string
): Promise<NarrativeReport | null> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.ANTHROPIC_API_KEY) return null;

  const analysis = await getQuizAnalysis(quizId);
  if (!analysis || analysis.responseCount === 0) return null;

  const blindSpots = findBlindSpots(analysis.questions);
  const hiddenStrengths = findHiddenStrengths(analysis.questions);
  const profile = getPerceptionProfile(
    analysis.categories,
    analysis.matchPercentage,
    blindSpots.length,
    hiddenStrengths.length
  );

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system:
      "You write MirrorQuiz's premium personality reports. Voice: warm, fun, casual, perceptive — never clinical, never sycophantic, never generic horoscope-speak. Every sentence should feel like it could only be about this specific person's data.",
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: buildPrompt(creatorName, analysis, blindSpots, hiddenStrengths, profile.label),
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    console.error("Narrative report generation refused");
    return null;
  }

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  if (!textBlock) return null;

  const report = parseReport(textBlock.text);
  if (!report) return null;

  const db = drizzle(env.DB, { schema });
  await db
    .insert(schema.narrativeReports)
    .values({
      id: nanoid(21),
      quizId,
      content: JSON.stringify(report),
      model: MODEL,
      responseCount: analysis.responseCount,
    })
    .onConflictDoUpdate({
      target: schema.narrativeReports.quizId,
      set: {
        content: JSON.stringify(report),
        model: MODEL,
        responseCount: analysis.responseCount,
      },
    });

  return report;
}

function parseReport(raw: string): NarrativeReport | null {
  try {
    const parsed = JSON.parse(raw) as NarrativeReport;
    if (
      !Array.isArray(parsed.paragraphs) ||
      parsed.paragraphs.length === 0 ||
      !Array.isArray(parsed.actions)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
