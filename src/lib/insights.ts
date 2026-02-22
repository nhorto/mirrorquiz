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

function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
