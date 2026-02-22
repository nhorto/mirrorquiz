"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionCard } from "@/components/question-card";
import { trackEvent } from "@/lib/analytics";
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
    router.push(`/quiz/${slug}/thanks`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  if (error && !quizInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const name = quizInfo?.creatorName ?? "this person";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Mirror<span className="text-primary">Quiz</span>
        </Link>
        <h1 className="mt-6 text-3xl font-bold">
          How well do you know{" "}
          <span className="text-primary">{name}</span>?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Rate how much each statement describes {name}. Be honest — your
          answers are anonymous.
        </p>
      </div>

      {/* Optional display name */}
      <div className="mb-8 space-y-2">
        <Label htmlFor="displayName">Your name (optional)</Label>
        <Input
          id="displayName"
          placeholder="e.g., Alex"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">
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
            text={q.textFriend}
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
          {submitting ? "Submitting..." : "Submit Answers"}
        </Button>
      </div>
    </div>
  );
}
