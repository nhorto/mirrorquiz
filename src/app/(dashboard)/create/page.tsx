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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Create Your Quiz</h1>
        <p className="mt-2 text-muted-foreground">
          Rate how much each statement describes you. Be honest — the magic
          happens when your answers differ from your friends&apos;.
        </p>
      </div>

      <div className="space-y-6">
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
          {answeredCount}/12 answered
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          size="lg"
        >
          {submitting ? "Creating..." : "Create Quiz & Get Link"}
        </Button>
      </div>
    </div>
  );
}
