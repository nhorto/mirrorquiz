import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getQuizAnalysis } from "@/lib/analysis";
import {
  findBlindSpots,
  findHiddenStrengths,
  getPerceptionProfile,
  generateNarrativeSummary,
  formatCategory,
} from "@/lib/insights";
import { getOrCreateNarrativeReport } from "@/lib/narrative";
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

  // LLM-written narrative report (generated once, cached in D1). Falls back
  // to the rule-based summary when ANTHROPIC_API_KEY isn't configured.
  const creatorName = session.user.name?.trim() || "there";
  const narrativeReport = hasPurchased
    ? await getOrCreateNarrativeReport(quizId, creatorName)
    : null;
  const narrative =
    hasPurchased && !narrativeReport
      ? generateNarrativeSummary(analysis.categories, analysis.matchPercentage, blindSpots, hiddenStrengths)
      : null;

  const adviceFor = (type: "blind_spot" | "hidden_strength", category: string) =>
    narrativeReport?.actions.find(
      (a) =>
        a.type === type &&
        (a.category.toLowerCase() === category.toLowerCase() ||
          a.category.toLowerCase() === formatCategory(category).toLowerCase())
    )?.advice;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Decorative blobs — homepage identity */}
      <div className="pointer-events-none fixed -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-violet/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 -left-24 -z-10 h-96 w-96 rounded-full bg-fuchsia/10 blur-3xl" />

      <Link
        href={`/dashboard/${quizId}/results`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back to Results
      </Link>

      {/* Premium document header */}
      <div className="animate-fade-in-up mt-6 border-b-2 border-violet/20 pb-6">
        <div className="inline-block rounded-full bg-violet/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet">
          Premium Report
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Your Full <span className="gradient-brand-text">Report</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Built from {analysis.responseCount} anonymous response
          {analysis.responseCount !== 1 ? "s" : ""} — the honest picture.
        </p>
      </div>

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

          {/* Narrative Report (LLM-written) or rule-based summary fallback */}
          {narrativeReport ? (
            <div className="rounded-2xl border border-violet/20 bg-card p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✍️</span>
                <h2 className="text-lg font-bold">How Your Friends Really See You</h2>
              </div>
              <div className="space-y-4">
                {narrativeReport.paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed text-foreground/90">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ) : narrative ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold mb-3">Your Perception Summary</h2>
              <p className="text-muted-foreground leading-relaxed">{narrative}</p>
            </div>
          ) : null}

          {/* Match Percentage + Radar — centerpiece treatment */}
          <div className="overflow-hidden rounded-3xl border-2 border-violet/20 bg-card shadow-xl shadow-violet/5">
            <div className="gradient-brand h-1.5 w-full" />
            <div className="p-3 py-6 sm:p-8">
              <div className="text-center">
                <h2 className="text-xl font-bold sm:text-2xl">
                  Self vs. <span className="gradient-brand-text">Friends</span> Perception
                </h2>
              </div>
              <PerceptionRadarChart categories={analysis.categories} />
              <div className="mt-2 flex justify-center border-t border-border/60 pt-6">
                <MatchPercentage percentage={analysis.matchPercentage} />
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/10">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Trait-by-Trait Breakdown</h2>
                <p className="text-sm text-muted-foreground">
                  All 12 traits, your rating vs. theirs.
                </p>
              </div>
            </div>
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
                  <BlindSpotCard
                    key={bs.textSelf}
                    insight={bs}
                    advice={adviceFor("blind_spot", bs.category)}
                  />
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
                  <HiddenStrengthCard
                    key={hs.textSelf}
                    insight={hs}
                    advice={adviceFor("hidden_strength", hs.category)}
                  />
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
