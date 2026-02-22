import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getQuizAnalysis } from "@/lib/analysis";
import { findBlindSpots, findHiddenStrengths } from "@/lib/insights";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import Link from "next/link";
import { PerceptionRadarChart } from "@/components/radar-chart";
import { MatchPercentage } from "@/components/match-percentage";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { BlindSpotCard } from "@/components/blind-spot-card";
import { HiddenStrengthCard } from "@/components/hidden-strength-card";

interface Props {
  params: Promise<{ quizId: string }>;
}

export default async function ReportPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { quizId } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  // Verify ownership
  const quiz = await db
    .select()
    .from(schema.quizzes)
    .where(
      and(
        eq(schema.quizzes.id, quizId),
        eq(schema.quizzes.userId, session.user.id)
      )
    )
    .limit(1);

  if (quiz.length === 0) notFound();
  const quizData = quiz[0]!;

  if (quizData.responseCount < 3) {
    redirect(`/dashboard/${quizId}/results`);
  }

  // Check purchase
  const purchase = await db
    .select()
    .from(schema.purchases)
    .where(
      and(
        eq(schema.purchases.quizId, quizId),
        eq(schema.purchases.userId, session.user.id),
        eq(schema.purchases.status, "completed")
      )
    )
    .limit(1);

  const hasPurchased = purchase.length > 0;

  const analysis = await getQuizAnalysis(quizId);
  if (!analysis) notFound();

  // Only compute paid insights if user has purchased
  const blindSpots = hasPurchased ? findBlindSpots(analysis.questions) : [];
  const hiddenStrengths = hasPurchased ? findHiddenStrengths(analysis.questions) : [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/dashboard/${quizId}/results`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Results
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Detailed Report</h1>
      <p className="mt-2 text-muted-foreground">
        Based on {analysis.responseCount} response
        {analysis.responseCount !== 1 ? "s" : ""}
      </p>

      {/* Always visible: radar + match */}
      <div className="mt-8 flex justify-center">
        <MatchPercentage percentage={analysis.matchPercentage} />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Self vs. Friends Perception
        </h2>
        <PerceptionRadarChart categories={analysis.categories} />
      </div>

      {/* Detailed sections — only rendered server-side if purchased */}
      {!hasPurchased ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-border bg-card p-10 text-center">
          <h3 className="text-2xl font-bold">Unlock Your Full Report</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            See your trait-by-trait breakdown, blind spots, and hidden
            strengths.
          </p>
          <Link
            href={`/api/stripe/checkout?quizId=${quizId}`}
            className="mt-4 inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Unlock — $7.99
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          {/* Category Breakdown */}
          <section className="mt-0">
            <h2 className="mb-4 text-xl font-semibold">
              Trait-by-Trait Breakdown
            </h2>
            <CategoryBreakdown categories={analysis.categories} />
          </section>

          {/* Blind Spots */}
          {blindSpots.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">
                Blind Spots ({blindSpots.length})
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Areas where you rate yourself significantly higher than your
                friends do.
              </p>
              <div className="space-y-4">
                {blindSpots.map((bs) => (
                  <BlindSpotCard key={bs.textSelf} insight={bs} />
                ))}
              </div>
            </section>
          )}

          {/* Hidden Strengths */}
          {hiddenStrengths.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">
                Hidden Strengths ({hiddenStrengths.length})
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Qualities your friends see in you that you undervalue.
              </p>
              <div className="space-y-4">
                {hiddenStrengths.map((hs) => (
                  <HiddenStrengthCard key={hs.textSelf} insight={hs} />
                ))}
              </div>
            </section>
          )}

          {/* No insights */}
          {blindSpots.length === 0 && hiddenStrengths.length === 0 && (
            <section className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-muted-foreground">
                No significant blind spots or hidden strengths detected. Your
                self-perception closely aligns with how others see you!
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
