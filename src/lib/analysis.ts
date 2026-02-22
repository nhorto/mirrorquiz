import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, avg, sql, asc } from "drizzle-orm";
import * as schema from "@/db/schema";

export interface QuestionComparison {
  questionId: string;
  category: string;
  textSelf: string;
  selfScore: number;
  friendsAvg: number;
  gap: number;
}

export interface CategoryComparison {
  category: string;
  selfAvg: number;
  friendsAvg: number;
  gap: number;
}

export interface AnalysisResult {
  questions: QuestionComparison[];
  categories: CategoryComparison[];
  matchPercentage: number;
  responseCount: number;
}

export async function getQuizAnalysis(quizId: string): Promise<AnalysisResult | null> {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  // Verify quiz exists and get response count + question set
  const quizResults = await db
    .select({
      responseCount: schema.quizzes.responseCount,
      questionSetId: schema.quizzes.questionSetId,
    })
    .from(schema.quizzes)
    .where(eq(schema.quizzes.id, quizId))
    .limit(1);

  if (quizResults.length === 0) return null;
  const responseCount = quizResults[0]!.responseCount;
  const questionSetId = quizResults[0]!.questionSetId;

  // Get self responses
  const selfRows = await db
    .select({
      questionId: schema.selfResponses.questionId,
      score: schema.selfResponses.score,
    })
    .from(schema.selfResponses)
    .where(eq(schema.selfResponses.quizId, quizId));

  if (selfRows.length === 0) return null;

  const selfScoreMap = new Map(selfRows.map((r) => [r.questionId, r.score]));

  // Get friend response averages per question
  const friendAvgs = await db
    .select({
      questionId: schema.friendResponses.questionId,
      avgScore: sql<number>`ROUND(AVG(${schema.friendResponses.score}), 2)`,
    })
    .from(schema.friendResponses)
    .where(eq(schema.friendResponses.quizId, quizId))
    .groupBy(schema.friendResponses.questionId);

  const friendAvgMap = new Map(friendAvgs.map((r) => [r.questionId, r.avgScore]));

  // Get questions for this quiz's question set
  const questionRows = await db
    .select({
      id: schema.questions.id,
      category: schema.questions.category,
      textSelf: schema.questions.textSelf,
      sortOrder: schema.questions.sortOrder,
    })
    .from(schema.questions)
    .where(eq(schema.questions.questionSetId, questionSetId))
    .orderBy(asc(schema.questions.sortOrder));

  // Build question comparisons
  const questions: QuestionComparison[] = questionRows.map((q) => {
    const selfScore = selfScoreMap.get(q.id) ?? 0;
    const friendsAvg = friendAvgMap.get(q.id) ?? selfScore;
    return {
      questionId: q.id,
      category: q.category,
      textSelf: q.textSelf,
      selfScore,
      friendsAvg,
      gap: Math.abs(selfScore - friendsAvg),
    };
  });

  // Build category comparisons
  const categoryMap = new Map<string, { selfScores: number[]; friendsAvgs: number[] }>();
  for (const q of questions) {
    const existing = categoryMap.get(q.category) ?? { selfScores: [], friendsAvgs: [] };
    existing.selfScores.push(q.selfScore);
    existing.friendsAvgs.push(q.friendsAvg);
    categoryMap.set(q.category, existing);
  }

  const categories: CategoryComparison[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => {
      const selfAvg = round(average(data.selfScores));
      const friendsAvg = round(average(data.friendsAvgs));
      return {
        category,
        selfAvg,
        friendsAvg,
        gap: round(Math.abs(selfAvg - friendsAvg)),
      };
    }
  );

  // Match percentage: 100 - (avg absolute gap across all questions × 20)
  const avgGap = average(questions.map((q) => q.gap));
  const matchPercentage = Math.max(0, Math.min(100, round(100 - avgGap * 20)));

  return {
    questions,
    categories,
    matchPercentage,
    responseCount,
  };
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round(n: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}
