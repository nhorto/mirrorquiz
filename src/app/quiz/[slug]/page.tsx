import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getQuiz(slug: string) {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  const results = await db
    .select({
      quizId: schema.quizzes.id,
      slug: schema.quizzes.slug,
      title: schema.quizzes.title,
      responseCount: schema.quizzes.responseCount,
      creatorName: schema.users.name,
      creatorEmail: schema.users.email,
    })
    .from(schema.quizzes)
    .innerJoin(schema.users, eq(schema.quizzes.userId, schema.users.id))
    .where(eq(schema.quizzes.slug, slug))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0]!;
  return {
    ...row,
    creatorName:
      row.creatorName && row.creatorName.trim()
        ? row.creatorName
        : row.creatorEmail?.split("@")[0] ?? "Someone",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuiz(slug);
  if (!quiz) return { title: "Quiz Not Found" };

  const name = quiz.creatorName ?? "Someone";
  const ogImage = `/api/og?slug=${slug}`;
  return {
    title: `How well do you know ${name}? — MirrorQuiz`,
    description: `${name} wants to know how you see them. Answer 12 quick questions and help them discover their blind spots.`,
    openGraph: {
      title: `How well do you know ${name}?`,
      description: `${name} wants to know how you see them. Answer 12 quick questions — it's anonymous and takes 2 minutes.`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `How well do you know ${name}?` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `How well do you know ${name}?`,
      description: `${name} wants to know how you see them. 2 minutes, 12 traits, 100% anonymous.`,
      images: [ogImage],
    },
  };
}

export default async function QuizLandingPage({ params }: Props) {
  const { slug } = await params;
  const quiz = await getQuiz(slug);
  if (!quiz) notFound();

  const name = quiz.creatorName ?? "this person";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Mirror<span className="text-primary">Quiz</span>
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How well do you know{" "}
            <span className="text-primary">{name}</span>?
          </h1>
          <p className="mt-4 text-muted-foreground">
            Answer 12 quick questions about how you perceive {name}. It takes
            about 2 minutes and helps them discover blind spots and hidden
            strengths.
          </p>
        </div>

        <Link
          href={`/quiz/${slug}/respond`}
          className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start Quiz
        </Link>

        <p className="mt-6 text-xs text-muted-foreground">
          No account needed. Your answers are anonymous.
        </p>
      </div>
    </div>
  );
}
