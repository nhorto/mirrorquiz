import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getQuizAnalysis } from "@/lib/analysis";
import {
  findBlindSpots,
  findHiddenStrengths,
  getPerceptionProfile,
  generateNarrativeSummary,
} from "@/lib/insights";
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
import { PerceptionProfileCard } from "@/components/perception-profile";

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

  // Compute profile and narrative for paid users
  const profile = hasPurchased
    ? getPerceptionProfile(analysis.categories, analysis.matchPercentage, blindSpots.length, hiddenStrengths.length)
    : null;
  const narrative = hasPurchased
    ? generateNarrativeSummary(analysis.categories, analysis.matchPercentage, blindSpots, hiddenStrengths)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/dashboard/${quizId}/results`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Results
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
        Your Full <span className="gradient-brand-text">Report</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Based on {analysis.responseCount} response
        {analysis.responseCount !== 1 ? "s" : ""}
      </p>

      {/* Paid content */}
      {!hasPurchased ? (
        <div className="mt-10 relative overflow-hidden rounded-2xl border-2 border-violet/30 p-10 text-center gradient-glow">
          <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-violet/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-fuchsia/20 blur-2xl" />
          <div className="relative">
            <h3 className="text-2xl font-extrabold">Unlock Your Full Report</h3>
            <p className="mt-2 max-w-sm mx-auto text-muted-foreground">
              See your perception profile, trait-by-trait breakdown, blind spots, and hidden
              strengths.
            </p>
            <Link
              href={`/api/stripe/checkout?quizId=${quizId}`}
              className="gradient-brand mt-6 inline-block rounded-full px-10 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              Unlock — $7.99
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Perception Profile */}
          {profile && (
            <PerceptionProfileCard profile={profile} />
          )}

          {/* Narrative Summary */}
          {narrative && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold mb-3">Your Perception Summary</h2>
              <p className="text-muted-foreground leading-relaxed">{narrative}</p>
            </div>
          )}

          {/* Match Percentage + Radar */}
          <div className="rounded-2xl border border-border bg-card p-8 flex justify-center">
            <MatchPercentage percentage={analysis.matchPercentage} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-bold">
              Self vs. Friends Perception
            </h2>
            <PerceptionRadarChart categories={analysis.categories} />
          </div>

          {/* Category Breakdown */}
          <section>
            <h2 className="mb-4 text-xl font-bold">
              Trait-by-Trait Breakdown
            </h2>
            <CategoryBreakdown categories={analysis.categories} />
          </section>

          {/* Blind Spots */}
          {blindSpots.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/10">
                  <span className="text-xl">🔍</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Blind Spots ({blindSpots.length})
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Areas where you rate yourself significantly higher than your friends do.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {blindSpots.map((bs) => (
                  <BlindSpotCard key={bs.textSelf} insight={bs} />
                ))}
              </div>
            </section>
          )}

          {/* Hidden Strengths */}
          {hiddenStrengths.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
                  <span className="text-xl">💎</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Hidden Strengths ({hiddenStrengths.length})
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Qualities your friends see in you that you undervalue.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {hiddenStrengths.map((hs) => (
                  <HiddenStrengthCard key={hs.textSelf} insight={hs} />
                ))}
              </div>
            </section>
          )}

          {/* No insights */}
          {blindSpots.length === 0 && hiddenStrengths.length === 0 && (
            <section className="rounded-2xl border border-border bg-card p-6 text-center">
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
