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
        : "Someone",
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
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia/20 blur-3xl" />

      <div className="relative w-full max-w-md text-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Mirror<span className="gradient-brand-text">Quiz</span>
        </Link>

        <div className="mt-8">
          <div className="mb-4 inline-block rounded-full bg-violet/10 px-4 py-1.5 text-sm font-medium text-violet">
            You&rsquo;ve been invited
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            How well do you know{" "}
            <span className="gradient-brand-text">{name}</span>?
          </h1>
          <p className="mt-4 text-muted-foreground">
            Answer 12 quick questions about how you perceive {name}. It takes
            about 2 minutes and helps them discover blind spots and hidden
            strengths.
          </p>
        </div>

        <Link
          href={`/quiz/${slug}/respond`}
          className="gradient-brand mt-8 inline-block rounded-full px-10 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          Start Quiz
        </Link>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            2 minutes
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Anonymous
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            No account needed
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground max-w-xs mx-auto">
          MirrorQuiz helps people discover how others really see them. Your honest answers make a difference.
        </p>
      </div>
    </div>
  );
}
