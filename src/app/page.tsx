import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            Perception<span className="text-primary">Quiz</span>
          </span>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            How do others{" "}
            <span className="text-primary">really</span> see you?
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Answer 12 quick questions about yourself, share a link with friends,
            and discover the gap between self-perception and reality.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create Your Quiz
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-lg border border-border px-8 py-3 text-base font-medium transition-colors hover:bg-accent"
            >
              How It Works
            </Link>
          </div>
        </div>
      </main>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border bg-muted/50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Three simple steps
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <StepCard
              step="1"
              title="Answer honestly"
              description="Rate yourself on 12 personality traits using a simple 1–5 scale. Takes about 2 minutes."
            />
            <StepCard
              step="2"
              title="Share your link"
              description="Send your unique quiz link to friends, family, or coworkers. They answer the same questions about you."
            />
            <StepCard
              step="3"
              title="See the gap"
              description="Compare your self-perception with how others see you. Discover blind spots and hidden strengths."
            />
          </div>
        </div>
      </section>

      {/* Social proof / value */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            The truth your friends won&apos;t tell you
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Research shows we have significant blind spots about our own
            personality. What you think is your greatest strength might not even
            register with the people around you — and your real superpower might
            be something you take for granted.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <InsightCard
              emoji="🔍"
              title="Blind Spots"
              description="Traits you rate highly but others don't notice as much."
            />
            <InsightCard
              emoji="💎"
              title="Hidden Strengths"
              description="Qualities others see in you that you underestimate."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Free to start, unlock the full picture
          </h2>
          <div className="mt-8 rounded-xl border border-border bg-card p-8">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold">$7.99</span>
              <span className="text-muted-foreground">one-time</span>
            </div>
            <p className="mt-2 text-muted-foreground">
              Free: radar chart + match percentage.
              <br />
              Paid: trait-by-trait breakdown, blind spots, and hidden strengths.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create Your Quiz — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PerceptionQuiz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function InsightCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-left">
      <span className="text-2xl">{emoji}</span>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
