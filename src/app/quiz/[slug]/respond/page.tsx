"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionCard } from "@/components/question-card";
import { trackEvent, fbqTrack } from "@/lib/analytics";
import Link from "next/link";

interface Question {
  id: string;
  category: string;
  textFriend: string;
  sortOrder: number;
}

interface QuizInfo {
  quizId: string;
  creatorName: string;
}

export default function RespondPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/quiz/${slug}`).then((r) => r.json() as Promise<QuizInfo & { error?: string }>),
      fetch("/api/questions").then((r) => r.json() as Promise<{ questions: Question[] }>),
    ])
      .then(([quizData, questionsData]) => {
        if (quizData.error) {
          setError(quizData.error);
        } else {
          setQuizInfo(quizData);
          setQuestions(questionsData.questions);
          fbqTrack("ViewContent", { content_name: "Quiz Start" });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load quiz");
        setLoading(false);
      });
  }, [slug]);

  const answeredCount = Object.keys(responses).length;
  const allAnswered = answeredCount === 12;
  const progressPercent = (answeredCount / 12) * 100;

  async function handleSubmit() {
    if (!allAnswered || !quizInfo) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: quizInfo.quizId,
        displayName: displayName.trim() || undefined,
        responses: Object.entries(responses).map(([questionId, score]) => ({
          questionId,
          score,
        })),
      }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to submit response");
      setSubmitting(false);
      return;
    }

    trackEvent("response_submitted", { slug });
    fbqTrack("CompleteRegistration");
    router.push(`/quiz/${slug}/thanks`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          <p className="mt-3 text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quizInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Link href="/" className="mt-4 inline-block text-violet font-medium hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const name = quizInfo?.creatorName ?? "this person";

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
          How well do you know{" "}
          <span className="gradient-brand-text">{name}</span>?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Rate how much each statement describes {name}. Be honest — your
          answers are anonymous.
        </p>
      </div>

      {/* Optional display name */}
      <div className="mt-6 mb-8 rounded-2xl border border-border bg-card p-5">
        <Label htmlFor="displayName" className="font-semibold">Your name (optional)</Label>
        <Input
          id="displayName"
          placeholder="e.g., Alex"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-2 max-w-xs"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Only shown to the quiz creator, never publicly.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            category={q.category}
            text={q.textFriend.replace(/\[Name\]/g, name)}
            value={responses[q.id] ?? null}
            onChange={(score) =>
              setResponses((prev) => ({ ...prev, [q.id]: score }))
            }
          />
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {allAnswered ? "All done!" : `${12 - answeredCount} more to go`}
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          size="lg"
          className={allAnswered ? "gradient-brand text-white border-0" : ""}
        >
          {submitting ? "Submitting..." : "Submit Answers"}
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        By submitting, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </Link>
        . Your responses are anonymous.
      </p>
    </div>
  );
}
