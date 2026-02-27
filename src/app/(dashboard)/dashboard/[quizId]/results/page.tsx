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
        <div className="mt-8 rounded-2xl border-2 border-dashed border-violet/30 bg-surface-violet p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber/10">
            <svg className="h-8 w-8 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold">Not enough responses yet</h1>
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

  // Compute teaser counts for paywall
  const blindSpotCount = findBlindSpots(analysis.questions).length;
  const hiddenStrengthCount = findHiddenStrengths(analysis.questions).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <TrackEvent
        event="results_viewed"
        properties={{ quizId, responseCount: analysis.responseCount, hasPurchased }}
        fbq={!hasPurchased ? { event: "AddToCart", params: { value: 7.99, currency: "USD" } } : undefined}
      />
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
        Your <span className="gradient-brand-text">Results</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Based on {analysis.responseCount} response
        {analysis.responseCount !== 1 ? "s" : ""}
      </p>

      {/* Match Percentage */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-8 flex justify-center">
        <MatchPercentage percentage={analysis.matchPercentage} />
      </div>

      {/* Radar Chart — blurred with redacted data if not purchased */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-bold">
          Self vs. Friends Perception
        </h2>
        {hasPurchased ? (
          <PerceptionRadarChart categories={analysis.categories} />
        ) : (
          <PerceptionRadarChart
            categories={analysis.categories.map((c) => ({
              ...c,
              selfAvg: 3,
              friendsAvg: 3,
              gap: 0,
            }))}
            blurred
          />
        )}
      </div>

      {/* Paywall CTA */}
      {!hasPurchased && (
        <div className="mt-8 relative overflow-hidden rounded-2xl border-2 border-violet/30 p-8 text-center gradient-glow">
          <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-violet/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-fuchsia/20 blur-2xl" />

          <div className="relative">
            <h2 className="text-2xl font-extrabold">Want the full picture?</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Your friends found{" "}
              {blindSpotCount > 0 && <><strong>{blindSpotCount} blind spot{blindSpotCount !== 1 ? "s" : ""}</strong></>}
              {blindSpotCount > 0 && hiddenStrengthCount > 0 && " and "}
              {hiddenStrengthCount > 0 && <><strong>{hiddenStrengthCount} hidden strength{hiddenStrengthCount !== 1 ? "s" : ""}</strong></>}
              {blindSpotCount === 0 && hiddenStrengthCount === 0 && "insights about your personality"}
              . Unlock your detailed report to see them all.
            </p>
            <ul className="mt-4 mx-auto max-w-xs text-left text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Your perception profile type
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Trait-by-trait breakdown with insights
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Blind spot &amp; hidden strength analysis
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Personalized reflection prompts
              </li>
            </ul>
            <CheckoutButton quizId={quizId} />
            <p className="mt-3 text-xs text-muted-foreground">
              One-time payment of $7.99. All sales are final.
            </p>
          </div>
        </div>
      )}

      {/* If purchased, link to full report */}
      {hasPurchased && (
        <div className="mt-8 text-center">
          <Link
            href={`/dashboard/${quizId}/report`}
            className="gradient-brand inline-block rounded-full px-10 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
          >
            View Full Report
          </Link>
        </div>
      )}
    </div>
  );
}
