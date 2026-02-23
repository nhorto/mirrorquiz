import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight">
            Mirror<span className="gradient-brand-text">Quiz</span>
          </span>
          <Link
            href="/login"
            className="gradient-brand rounded-full px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            Take the Quiz
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia/20 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <div className="mb-6 inline-block rounded-full bg-violet/10 px-4 py-1.5 text-sm font-medium text-violet">
            Most people think they&rsquo;re self-aware. Very few actually are.
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
            Your blind spots aren&rsquo;t a secret.{" "}
            <span className="gradient-brand-text">They&rsquo;re just a secret from you.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            We all have blind spots about our own personality.
            The traits you&rsquo;re most proud of might not register with the people
            around you &mdash; and your real superpower might be something you take
            for granted.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="gradient-brand rounded-full px-10 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
            >
              Discover Your Blind Spots
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-full border border-border px-8 py-4 text-base font-medium transition-colors hover:bg-accent"
            >
              How It Works
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Free to start &middot; No account required for friends &middot; Based on personality psychology research
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-surface-violet py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Three steps. <span className="gradient-brand-text">Zero sugarcoating.</span>
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            <StepCard
              step="1"
              title="Rate yourself honestly"
              description="Score yourself on 12 personality traits — things like how funny you are, how well you listen, how creative you think you are. Be honest — nobody&rsquo;s watching (yet)."
              accentColor="violet"
            />
            <StepCard
              step="2"
              title="Share your link"
              description="Send your unique quiz link to friends, family, or coworkers. They answer anonymously — so they can be honest too."
              accentColor="fuchsia"
            />
            <StepCard
              step="3"
              title="See what they see"
              description="Discover where your self-image matches reality, where you&rsquo;re selling yourself short, and what surprises are hiding in the gap."
              accentColor="amber"
            />
          </div>
        </div>
      </section>

      {/* The Science */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            This isn&rsquo;t a <span className="gradient-brand-text">viral personality quiz</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            In the 1950s, psychologists Joseph Luft and Harrington Ingham created
            the Johari Window &mdash; a framework showing that parts of our personality
            are visible to others but invisible to ourselves. Decades later,
            researcher Simine Vazire proved that friends are actually more accurate
            than we are at rating many of our own traits. The closer a trait is to
            how we want to be seen, the worse we are at judging it.
          </p>
          <p className="mt-4 text-lg font-medium text-foreground">
            We turned that science into something you can actually use.
          </p>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            What you&rsquo;ll <span className="gradient-brand-text">discover</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Your results reveal four types of insights that most people never get
            access to &mdash; until now.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ValueCard
              icon="🔍"
              title="Blind Spots"
              description="Traits you rate highly but others don&rsquo;t see. We tend to overestimate the qualities we value most in ourselves."
              accentColor="rose"
            />
            <ValueCard
              icon="💎"
              title="Hidden Strengths"
              description="Superpowers you take for granted. These are the things others admire about you that you&rsquo;ve never given yourself credit for."
              accentColor="teal"
            />
            <ValueCard
              icon="📊"
              title="The Perception Gap"
              description="Self-ratings and friend-ratings often diverge more than you&rsquo;d expect. Your radar chart reveals exactly where your gaps are."
              accentColor="violet"
            />
            <ValueCard
              icon="💡"
              title="Aha Moments"
              description="The moments that change how you see yourself — like learning you&rsquo;re funnier than you thought, or less patient than you assumed."
              accentColor="amber"
            />
          </div>
        </div>
      </section>

      {/* Example Results */}
      <section className="bg-surface-violet py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            What real blind spots <span className="gradient-brand-text">look like</span>
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            <ExampleCard
              name="Sarah"
              trait="Humor"
              selfScore={2}
              friendScore={4.2}
              insight="Sarah never thought she was funny. Her friends say she&rsquo;s one of the funniest people they know."
              type="hidden-strength"
            />
            <ExampleCard
              name="Marcus"
              trait="Listening"
              selfScore={5}
              friendScore={3.1}
              insight="Marcus prides himself on being a great listener. His friends say he interrupts more than he realizes."
              type="blind-spot"
            />
            <ExampleCard
              name="Jordan"
              trait="Leadership"
              selfScore={2}
              friendScore={4.5}
              insight="Jordan never saw herself as a leader. Her friends rated her leadership higher than almost any other trait."
              type="hidden-strength"
            />
          </div>
        </div>
      </section>

      {/* Stat Bar */}
      <section className="gradient-brand py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-around gap-8 px-6 text-center text-white sm:flex-row sm:gap-4">
          <StatItem value="12" label="traits where self-knowledge breaks down" />
          <StatItem value="100%" label="anonymous so they can be honest" />
          <StatItem value="2 min" label="to see what you can't" />
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Start free. <span className="gradient-brand-text">Go deep when you&rsquo;re ready.</span>
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {/* Free tier */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Free
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$0</span>
              </div>
              <p className="mt-3 text-muted-foreground">
                See the big picture &mdash; your overall match and radar chart.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <FeatureItem included>Radar chart comparison</FeatureItem>
                <FeatureItem included>Overall match percentage</FeatureItem>
                <FeatureItem included>Unlimited friend responses</FeatureItem>
                <FeatureItem>Trait-by-trait breakdown</FeatureItem>
                <FeatureItem>Blind spot analysis</FeatureItem>
                <FeatureItem>Hidden strength insights</FeatureItem>
              </ul>
              <Link
                href="/login"
                className="mt-8 block rounded-full border border-border py-3 text-center font-medium transition-colors hover:bg-accent"
              >
                Get Started Free
              </Link>
            </div>
            {/* Paid tier */}
            <div className="relative rounded-2xl border-2 border-violet bg-card p-8 gradient-glow">
              <div className="absolute -top-3 right-6 rounded-full bg-violet px-3 py-0.5 text-xs font-bold text-white">
                Full Picture
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-violet">
                Premium
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$7.99</span>
                <span className="text-muted-foreground">one-time</span>
              </div>
              <p className="mt-3 text-muted-foreground">
                Cheaper than a personality test. Way more fun.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                See exactly which traits you overestimate, which ones you undervalue,
                and what your friends would never tell you to your face.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <FeatureItem included>Radar chart comparison</FeatureItem>
                <FeatureItem included>Overall match percentage</FeatureItem>
                <FeatureItem included>Unlimited friend responses</FeatureItem>
                <FeatureItem included>Trait-by-trait breakdown</FeatureItem>
                <FeatureItem included>Blind spot analysis</FeatureItem>
                <FeatureItem included>Hidden strength insights</FeatureItem>
              </ul>
              <Link
                href="/login"
                className="gradient-brand mt-8 block rounded-full py-3 text-center font-medium text-white transition-transform hover:scale-105"
              >
                Unlock Full Results
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="gradient-brand py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your friends already know your blind spots. Now you can too.
          </h2>
          <p className="mt-4 text-lg text-white/80">
            It takes 2 minutes. The insights last a lifetime.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-semibold text-foreground shadow-lg transition-transform hover:scale-105"
          >
            Create Your Free Quiz
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently asked <span className="gradient-brand-text">questions</span>
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            <FaqItem
              question="Are the responses really anonymous?"
              answer="Yes — all responses are completely anonymous. Your friends never see each other&rsquo;s answers, and you never see who said what. Anonymity is what makes the results trustworthy."
            />
            <FaqItem
              question="What do most people discover?"
              answer="Most people are pleasantly surprised. The biggest gaps tend to be hidden strengths &mdash; things your friends see in you that you&rsquo;ve been undervaluing. The blind spots are just as valuable &mdash; it&rsquo;s the kind of honest feedback most people never get."
            />
            <FaqItem
              question="Is this scientifically valid?"
              answer="The quiz is inspired by the Johari Window framework and research on self-other knowledge asymmetries by psychologist Simine Vazire. It&rsquo;s not a clinical assessment &mdash; it&rsquo;s a tool for self-reflection built on established ideas from personality psychology."
            />
            <FaqItem
              question="How many friends do I need?"
              answer="You can see results with just one response, but 3&ndash;5 friends gives you a much more reliable picture. The more perspectives, the clearer the patterns become."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <span className="text-lg font-bold tracking-tight">
                Mirror<span className="gradient-brand-text">Quiz</span>
              </span>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover how the world really sees you.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          <div className="mt-6 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MirrorQuiz. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

const accentBgClasses: Record<string, string> = {
  violet: "bg-violet/10",
  fuchsia: "bg-fuchsia/10",
  amber: "bg-amber/10",
  teal: "bg-teal/10",
  rose: "bg-rose/10",
};

const accentTextClasses: Record<string, string> = {
  violet: "text-violet",
  fuchsia: "text-fuchsia",
  amber: "text-amber",
  teal: "text-teal",
  rose: "text-rose",
};

const accentBorderClasses: Record<string, string> = {
  violet: "border-violet/20",
  fuchsia: "border-fuchsia/20",
  amber: "border-amber/20",
  teal: "border-teal/20",
  rose: "border-rose/20",
};

function StepCard({
  step,
  title,
  description,
  accentColor,
}: {
  step: string;
  title: string;
  description: string;
  accentColor: string;
}) {
  return (
    <div className={`group relative rounded-2xl border ${accentBorderClasses[accentColor] ?? "border-violet/20"} bg-card p-8 text-center transition-all hover:-translate-y-1 hover:shadow-xl`}>
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${accentBgClasses[accentColor] ?? "bg-violet/10"} text-xl font-bold ${accentTextClasses[accentColor] ?? "text-violet"}`}>
        {step}
      </div>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
  accentColor,
}: {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
}) {
  return (
    <div className={`group relative rounded-2xl border ${accentBorderClasses[accentColor] ?? "border-violet/20"} bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl`}>
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${accentBgClasses[accentColor] ?? "bg-violet/10"} text-2xl`}>
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function ExampleCard({
  name,
  trait,
  selfScore,
  friendScore,
  insight,
  type,
}: {
  name: string;
  trait: string;
  selfScore: number;
  friendScore: number;
  insight: string;
  type: "blind-spot" | "hidden-strength";
}) {
  const isBlindSpot = type === "blind-spot";
  const accentBg = isBlindSpot ? "bg-rose/10" : "bg-teal/10";
  const accentText = isBlindSpot ? "text-rose" : "text-teal";
  const accentBorder = isBlindSpot ? "border-rose/20" : "border-teal/20";
  const barColor = isBlindSpot ? "bg-rose" : "bg-teal";

  return (
    <div className={`group relative rounded-2xl border ${accentBorder} bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-sm font-medium text-muted-foreground">{trait}</p>
        </div>
        <span className={`rounded-full ${accentBg} ${accentText} px-3 py-1 text-xs font-semibold`}>
          {isBlindSpot ? "Blind Spot" : "Hidden Strength"}
        </span>
      </div>
      <div className="mt-5 space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Self</span>
            <span className="font-bold">{selfScore}/5</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/30 transition-all"
              style={{ width: `${(selfScore / 5) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Friends</span>
            <span className={`font-bold ${accentText}`}>{friendScore}/5</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${barColor} transition-all`}
              style={{ width: `${(friendScore / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{insight}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="text-base font-bold">{question}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-extrabold sm:text-4xl">{value}</div>
      <div className="mt-1 text-sm text-white/80">{label}</div>
    </div>
  );
}

function FeatureItem({
  children,
  included = false,
}: {
  children: React.ReactNode;
  included?: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      {included ? (
        <svg className="h-4 w-4 shrink-0 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4 shrink-0 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
        </svg>
      )}
      <span className={included ? "" : "text-muted-foreground"}>{children}</span>
    </li>
  );
}
