"use client";

import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionCard } from "@/components/question-card";
import { ShareLink } from "@/components/share-link";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

interface Question {
  id: string;
  category: string;
  textSelf: string;
  sortOrder: number;
}

export default function StartQuizPage() {
  const { data: session } = authClient.useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionSetId, setQuestionSetId] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ slug: string; emailSent: boolean } | null>(null);
  const startedRef = useRef(false);
  const claimRef = useRef<HTMLDivElement>(null);

  // A signed-in real user doesn't need the email step; anonymous or
  // signed-out visitors do.
  const isRealUser =
    !!session?.user &&
    (session.user as { isAnonymous?: boolean | null }).isAnonymous !== true;

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json() as Promise<{ questions: Question[]; questionSetId: string }>)
      .then((data) => {
        setQuestions(data.questions);
        setQuestionSetId(data.questionSetId);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load questions. Please refresh and try again.");
        setLoading(false);
      });
  }, []);

  const answeredCount = Object.keys(responses).length;
  const allAnswered = answeredCount === 12;
  const progressPercent = (answeredCount / 12) * 100;

  useEffect(() => {
    if (allAnswered && claimRef.current) {
      claimRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [allAnswered]);

  function handleAnswer(questionId: string, score: number) {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("quiz_started");
    }
    setResponses((prev) => ({ ...prev, [questionId]: score }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      // 1. Make sure we have a session — anonymous if the visitor is new.
      if (!session?.user) {
        const { error: anonError } = await authClient.signIn.anonymous();
        if (anonError) {
          setError("Something went wrong starting your session. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      // 2. Save the name so the quiz reads "Alex's Quiz" for friends.
      const trimmedName = name.trim();
      if (trimmedName && !isRealUser) {
        await authClient.updateUser({ name: trimmedName });
      }

      // 3. Create the quiz under the current (possibly anonymous) session.
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionSetId,
          responses: Object.entries(responses).map(([questionId, score]) => ({
            questionId,
            score,
          })),
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to create your quiz. Please try again.");
        setSubmitting(false);
        return;
      }

      const { slug } = (await res.json()) as { slug: string };
      trackEvent("quiz_completed");
      trackEvent("quiz_created", { slug, flow: "deferred_signup" });

      // 4. Record the claim + send the magic link so they can get back in
      //    later. The share link below works immediately either way — no
      //    need to leave this browser (important inside in-app browsers).
      let emailSent = false;
      if (!isRealUser) {
        const claimRes = await fetch("/api/quiz/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), name: trimmedName }),
        });
        emailSent = claimRes.ok;
        if (emailSent) {
          trackEvent("email_captured", { flow: "deferred_signup" });
        }
      }

      setCreated({ slug, emailSent });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          <p className="mt-3 text-muted-foreground">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  // ─── Done: quiz is live, show the share link right here ───
  if (created) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="pointer-events-none fixed -top-24 -left-24 h-96 w-96 rounded-full bg-violet/20 blur-3xl" />
        <div className="pointer-events-none fixed -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia/20 blur-3xl" />

        <div className="relative text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="h-10 w-10 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Your quiz is <span className="gradient-brand-text">live!</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Now for the fun part — send this link to friends and find out how
            they really see you. You&rsquo;ll unlock results after{" "}
            <strong>3 responses</strong>.
          </p>
        </div>

        <div className="relative mt-8 rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h2 className="font-bold">Share your link</h2>
          <ShareLink slug={created.slug} />
        </div>

        {created.emailSent && (
          <div className="relative mt-6 rounded-2xl border border-violet/20 bg-surface-violet p-5 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Check your inbox:</strong> we
              sent a sign-in link to <strong className="text-foreground">{email.trim()}</strong> so
              you can get back to your results anytime, on any device. No
              password needed — and no rush, your quiz is already collecting
              responses.
            </p>
          </div>
        )}

        <div className="relative mt-8 text-center">
          <Link
            href="/dashboard"
            className="gradient-brand inline-block rounded-full px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ─── Quiz + email capture ───
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Progress bar */}
      <div className="sticky top-0 z-40 -mx-6 bg-background/80 backdrop-blur-md px-6 pb-4 pt-3">
        <div className="flex items-center justify-between text-sm">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Mirror<span className="gradient-brand-text">Quiz</span>
          </Link>
          <span className="font-medium text-muted-foreground">{answeredCount}/12</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-brand transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Rate <span className="gradient-brand-text">yourself</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Be honest — the magic happens when your answers differ from your
          friends&rsquo;. Takes about 2 minutes, no account needed.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            category={q.category}
            text={q.textSelf}
            value={responses[q.id] ?? null}
            onChange={(score) => handleAnswer(q.id, score)}
          />
        ))}
      </div>

      {/* Email capture — appears once all 12 are answered */}
      <div ref={claimRef} className="mt-10">
        {allAnswered ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border-2 border-violet/30 bg-card p-6 gradient-glow sm:p-8"
          >
            <h2 className="text-2xl font-extrabold">
              Last step: <span className="gradient-brand-text">get your share link</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isRealUser
                ? `Creating this quiz as ${session?.user.name ?? "you"}.`
                : "Enter your email to save your results and get your unique link to send to friends."}
            </p>

            {!isRealUser && (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your first name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    Shows on your quiz so friends know who they&rsquo;re rating.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    So you can get back to your results. No password, no spam.
                  </p>
                </div>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-6 w-full gradient-brand text-white border-0"
            >
              {submitting ? "Creating your quiz..." : "Create My Quiz & Get Link"}
            </Button>

            {!isRealUser && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                  Privacy Policy
                </Link>
                .
              </p>
            )}
          </form>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {12 - answeredCount} more to go — your share link is waiting at the end.
          </p>
        )}
      </div>

      {!isRealUser && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have a quiz?{" "}
          <Link href="/login" className="text-violet font-medium underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
