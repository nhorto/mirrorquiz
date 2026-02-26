"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/question-card";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

interface Question {
  id: string;
  category: string;
  textSelf: string;
  sortOrder: number;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionSetId, setQuestionSetId] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json() as Promise<{ questions: Question[]; questionSetId: string }>)
      .then((data) => {
        setQuestions(data.questions);
        setQuestionSetId(data.questionSetId);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load questions");
        setLoading(false);
      });
  }, []);

  const answeredCount = Object.keys(responses).length;
  const allAnswered = answeredCount === 12;
  const progressPercent = (answeredCount / 12) * 100;

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

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
      setError(data.error ?? "Failed to create quiz");
      setSubmitting(false);
      return;
    }

    const { slug } = (await res.json()) as { slug: string };
    trackEvent("quiz_created", { slug });
    router.push(`/dashboard?created=${slug}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          <p className="mt-3 text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Progress bar */}
      <div className="sticky top-[57px] z-40 -mx-6 bg-background/80 backdrop-blur-md px-6 pb-4 pt-2">
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Dashboard
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
          friends&apos;.
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
          {allAnswered ? "All done! Create your quiz." : `${12 - answeredCount} more to go`}
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          size="lg"
          className={allAnswered ? "gradient-brand text-white border-0" : ""}
        >
          {submitting ? "Creating..." : "Create Quiz & Get Link"}
        </Button>
      </div>
    </div>
  );
}
