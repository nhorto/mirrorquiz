import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getQuizAnalysis } from "@/lib/analysis";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import Link from "next/link";
import { PerceptionRadarChart } from "@/components/radar-chart";
import { MatchPercentage } from "@/components/match-percentage";
import { TrackEvent } from "@/components/track-event";
import { CheckoutButton } from "@/components/checkout-button";

interface Props {
  params: Promise<{ quizId: string }>;
}

export default async function ResultsPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { quizId } = await params;

  // Verify ownership
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });
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

  // Minimum 3 responses
  if (quizData.responseCount < 3) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Dashboard
        </Link>
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">Not enough responses yet</h1>
          <p className="mt-3 text-muted-foreground">
            You need at least <strong>3 responses</strong> before results are
            available. You currently have{" "}
            <strong>{quizData.responseCount}</strong>.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Share your quiz link to get more responses!
          </p>
        </div>
      </div>
    );
  }

  const analysis = await getQuizAnalysis(quizId);
  if (!analysis) notFound();

  // Check if user has purchased the detailed report
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <TrackEvent event="results_viewed" properties={{ quizId, responseCount: analysis.responseCount, hasPurchased }} />
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Your Results</h1>
      <p className="mt-2 text-muted-foreground">
        Based on {analysis.responseCount} response
        {analysis.responseCount !== 1 ? "s" : ""}
      </p>

      {/* Free: Match Percentage */}
      <div className="mt-8 flex justify-center">
        <MatchPercentage percentage={analysis.matchPercentage} />
      </div>

      {/* Free: Radar Chart */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Self vs. Friends Perception
        </h2>
        <PerceptionRadarChart categories={analysis.categories} />
      </div>

      {/* Paywall CTA */}
      {!hasPurchased && (
        <div className="mt-8 rounded-xl border-2 border-primary/30 bg-primary/5 p-8 text-center">
          <h2 className="text-2xl font-bold">Want the full picture?</h2>
          <p className="mt-2 text-muted-foreground">
            Unlock your detailed report with trait-by-trait breakdowns, blind
            spots, and hidden strengths.
          </p>
          <CheckoutButton quizId={quizId} />
          <p className="mt-3 text-xs text-muted-foreground">
            One-time payment of $7.99. All sales are final.
          </p>
        </div>
      )}

      {/* If purchased, link to full report */}
      {hasPurchased && (
        <div className="mt-8 text-center">
          <Link
            href={`/dashboard/${quizId}/report`}
            className="inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View Full Report
          </Link>
        </div>
      )}
    </div>
  );
}
