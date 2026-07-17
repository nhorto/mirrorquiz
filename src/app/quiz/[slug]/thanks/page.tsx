import { TrackEvent } from "@/components/track-event";
import { CreateYourOwnCta } from "@/components/create-your-own-cta";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ThanksPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <TrackEvent event="respondent_thanks_viewed" properties={{ slug }} />
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet/20 blur-3xl" />

      <div className="relative w-full max-w-md text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg
            className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">Thanks!</h1>
        <p className="mt-3 text-muted-foreground">
          Your answers have been recorded anonymously. The quiz creator will be
          notified.
        </p>

        {/* CTA — the highest-intent moment in the whole funnel */}
        <div className="mt-10 space-y-5 rounded-2xl border-2 border-violet/30 bg-card p-8 gradient-glow">
          <p className="text-2xl font-extrabold leading-tight">
            Now it&apos;s <span className="gradient-brand-text">your</span> turn.
          </p>
          <p className="text-base text-muted-foreground">
            You just told a friend how you see them. Want to know how{" "}
            <em>your</em> friends really see you? Take the same 2-minute quiz
            and send them your link.
          </p>
          <CreateYourOwnCta slug={slug} />
          <p className="text-sm text-muted-foreground">
            Free &middot; No account needed to start
          </p>
        </div>

        {/* MirrorQuiz explanation */}
        <div className="mt-8 rounded-2xl border border-violet/20 bg-surface-violet p-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold tracking-tight">
              Mirror<span className="gradient-brand-text">Quiz</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MirrorQuiz helps you discover how others really see you — your blind spots,
            hidden strengths, and the gaps between self-perception and reality.
            Based on personality psychology research.
          </p>
        </div>
      </div>
    </div>
  );
}
