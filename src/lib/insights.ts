import type { QuestionComparison, CategoryComparison } from "./analysis";

const GAP_THRESHOLD = 1.5;

export interface Insight {
  category: string;
  textSelf: string;
  selfScore: number;
  friendsAvg: number;
  gap: number;
}

export interface BlindSpot extends Insight {
  type: "blind_spot";
}

export interface HiddenStrength extends Insight {
  type: "hidden_strength";
}

export function findBlindSpots(questions: QuestionComparison[]): BlindSpot[] {
  return questions
    .filter((q) => q.selfScore - q.friendsAvg >= GAP_THRESHOLD)
    .sort((a, b) => b.gap - a.gap)
    .map((q) => ({
      type: "blind_spot" as const,
      category: q.category,
      textSelf: q.textSelf,
      selfScore: q.selfScore,
      friendsAvg: q.friendsAvg,
      gap: q.gap,
    }));
}

export function findHiddenStrengths(questions: QuestionComparison[]): HiddenStrength[] {
  return questions
    .filter((q) => q.friendsAvg - q.selfScore >= GAP_THRESHOLD)
    .sort((a, b) => b.gap - a.gap)
    .map((q) => ({
      type: "hidden_strength" as const,
      category: q.category,
      textSelf: q.textSelf,
      selfScore: q.selfScore,
      friendsAvg: q.friendsAvg,
      gap: q.gap,
    }));
}

export function getCategoryInsight(cat: CategoryComparison): string {
  const diff = cat.selfAvg - cat.friendsAvg;
  const absDiff = Math.abs(diff);
  const catName = formatCategory(cat.category);

  if (absDiff < 0.5) {
    return `Your self-perception of ${catName} closely matches how others see you.`;
  } else if (diff > 0) {
    return `You rate yourself higher on ${catName} than your friends do. This could be a blind spot.`;
  } else {
    return `Your friends see more ${catName} in you than you give yourself credit for. This is a hidden strength!`;
  }
}

export function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ─── Perception Profile Types ─── */

export interface PerceptionProfile {
  type: "open-book" | "hidden-gem" | "confident-one" | "enigma" | "self-aware";
  label: string;
  icon: string;
  description: string;
}

const PROFILES: Record<PerceptionProfile["type"], Omit<PerceptionProfile, "type">> = {
  "open-book": {
    label: "The Open Book",
    icon: "📖",
    description: "Your friends see you almost exactly as you see yourself. What you project is what people receive — that's rare and genuine.",
  },
  "hidden-gem": {
    label: "The Hidden Gem",
    icon: "💎",
    description: "Your friends consistently rate you higher than you rate yourself. You have strengths you're not giving yourself credit for.",
  },
  "confident-one": {
    label: "The Confident One",
    icon: "🪞",
    description: "You tend to rate yourself higher than your friends do. You might be projecting more confidence than others perceive.",
  },
  "enigma": {
    label: "The Enigma",
    icon: "🌀",
    description: "Your results are a mix — some blind spots, some hidden strengths. People see a different version of you depending on the trait.",
  },
  "self-aware": {
    label: "The Self-Aware",
    icon: "🎯",
    description: "Near-perfect alignment with tiny, balanced gaps. You have an unusually accurate understanding of how others experience you.",
  },
};

export function getPerceptionProfile(
  categories: CategoryComparison[],
  matchPercentage: number,
  blindSpotCount: number,
  hiddenStrengthCount: number,
): PerceptionProfile {
  const avgSignedGap =
    categories.reduce((sum, c) => sum + (c.selfAvg - c.friendsAvg), 0) / categories.length;

  let type: PerceptionProfile["type"];

  if (matchPercentage >= 85 && Math.abs(avgSignedGap) < 0.3) {
    type = "self-aware";
  } else if (matchPercentage >= 75 && Math.abs(avgSignedGap) < 0.5) {
    type = "open-book";
  } else if (hiddenStrengthCount > blindSpotCount && avgSignedGap < -0.3) {
    type = "hidden-gem";
  } else if (blindSpotCount > hiddenStrengthCount && avgSignedGap > 0.3) {
    type = "confident-one";
  } else {
    type = "enigma";
  }

  return { type, ...PROFILES[type] };
}

/* ─── Narrative Summary ─── */

export function generateNarrativeSummary(
  categories: CategoryComparison[],
  matchPercentage: number,
  blindSpots: BlindSpot[],
  hiddenStrengths: HiddenStrength[],
): string {
  const parts: string[] = [];

  // Opening line about overall alignment
  if (matchPercentage >= 80) {
    parts.push("Overall, your friends see you pretty similarly to how you see yourself.");
  } else if (matchPercentage >= 60) {
    parts.push("Your self-image and how your friends see you overlap in some areas but diverge in others.");
  } else {
    parts.push("There's a notable gap between how you see yourself and how your friends experience you.");
  }

  // Biggest blind spot
  if (blindSpots.length > 0) {
    const top = blindSpots[0]!;
    const catName = formatCategory(top.category);
    parts.push(
      `You rate yourself higher on ${catName} than your friends do — that's your biggest blind spot.`,
    );
  }

  // Biggest hidden strength
  if (hiddenStrengths.length > 0) {
    const top = hiddenStrengths[0]!;
    const catName = formatCategory(top.category);
    parts.push(
      `On the flip side, your friends see more ${catName} in you than you give yourself credit for.`,
    );
  }

  // If no blind spots or hidden strengths, comment on balance
  if (blindSpots.length === 0 && hiddenStrengths.length === 0) {
    parts.push(
      "No single trait stands out as a major gap — your self-awareness is well-calibrated across the board.",
    );
  }

  return parts.join(" ");
}

/* ─── Richer Category Insights ─── */

export function getCategoryInsightDetailed(cat: CategoryComparison): {
  insight: string;
  reflection: string;
  colorClass: string;
} {
  const diff = cat.selfAvg - cat.friendsAvg;
  const absDiff = Math.abs(diff);
  const catName = formatCategory(cat.category);

  let insight: string;
  let reflection: string;
  let colorClass: string;

  if (absDiff < 0.5) {
    colorClass = "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20";
    insight = `Your self-perception of ${catName} closely matches how others see you. This is a sign of strong self-awareness in this area.`;
    reflection = `This alignment suggests you have an accurate read on your own ${catName.toLowerCase()}. Keep trusting your instincts here.`;
  } else if (absDiff < 1.0) {
    colorClass = "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20";
    if (diff > 0) {
      insight = `You see yourself as slightly more ${catName.toLowerCase()} than your friends do. It's a small gap, but worth noticing.`;
      reflection = `Ask yourself: is there a context where you show this trait more than others? The gap might be situational.`;
    } else {
      insight = `Your friends see a bit more ${catName.toLowerCase()} in you than you recognize. You might be underselling yourself here.`;
      reflection = `Consider that you might take this quality for granted. What feels ordinary to you might stand out to others.`;
    }
  } else {
    colorClass = "border-rose-500/30 bg-rose-50 dark:bg-rose-950/20";
    if (diff > 0) {
      insight = `There's a significant gap in ${catName} — you rate yourself notably higher than your friends do. This is one of your biggest perception gaps.`;
      reflection = `This doesn't mean you lack ${catName.toLowerCase()}, but there may be a disconnect between your intent and how it lands with others.`;
    } else {
      insight = `Your friends rate your ${catName} significantly higher than you do. This is a genuine hidden strength you're undervaluing.`;
      reflection = `You might dismiss this quality as "just being normal," but your friends notice and value it. Own it.`;
    }
  }

  return { insight, reflection, colorClass };
}

/* ─── Detailed Blind Spot / Hidden Strength Text ─── */

export function getBlindSpotDetail(bs: BlindSpot): { explanation: string; reflection: string } {
  const catName = formatCategory(bs.category);
  const gap = bs.selfScore - bs.friendsAvg;

  let explanation: string;
  if (gap >= 2.5) {
    explanation = `You rated yourself ${bs.selfScore}/5 on this, but your friends averaged ${bs.friendsAvg.toFixed(1)}/5. That's a major gap — one of the largest in your results. In ${catName}, the story you tell yourself may be quite different from what others observe.`;
  } else {
    explanation = `You see yourself as a ${bs.selfScore}/5 here, while your friends see you closer to ${bs.friendsAvg.toFixed(1)}/5. The gap in ${catName} suggests your self-image doesn't fully match the impression you leave.`;
  }

  const reflection = `Reflect on this: when it comes to ${catName.toLowerCase()}, is there a version of yourself you aspire to be that hasn't fully shown up in how others experience you yet?`;

  return { explanation, reflection };
}

export function getHiddenStrengthDetail(hs: HiddenStrength): { explanation: string; reflection: string } {
  const catName = formatCategory(hs.category);
  const gap = hs.friendsAvg - hs.selfScore;

  let explanation: string;
  if (gap >= 2.5) {
    explanation = `Your friends rated you ${hs.friendsAvg.toFixed(1)}/5 on this, but you only gave yourself ${hs.selfScore}/5. That's a huge gap — your friends see something in you that you might be completely overlooking.`;
  } else {
    explanation = `You rated yourself ${hs.selfScore}/5, but your friends see you at ${hs.friendsAvg.toFixed(1)}/5. When it comes to ${catName}, you're selling yourself short.`;
  }

  const reflection = `Think about this: what would change if you believed you were as strong in ${catName.toLowerCase()} as your friends say you are?`;

  return { explanation, reflection };
}
