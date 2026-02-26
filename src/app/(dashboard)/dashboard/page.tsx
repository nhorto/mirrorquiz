import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import * as schema from "@/db/schema";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { ShareLink } from "@/components/share-link";

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + (dateStr.includes("Z") ? "" : "Z"));
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  const userQuizzes = await db
    .select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.userId, session.user.id))
    .orderBy(desc(schema.quizzes.createdAt));

  const params = await searchParams;
  const justCreated = params.created;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="gradient-brand-text">{session.user.name}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            {userQuizzes.length === 0
              ? "Create your first quiz to get started."
              : `You have ${userQuizzes.length} quiz${userQuizzes.length !== 1 ? "zes" : ""}.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="gradient-brand rounded-full px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            New Quiz
          </Link>
          <SignOutButton />
        </div>
      </div>

      {/* Just created banner — compact, no share duplication */}
      {justCreated && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 dark:border-emerald-800 dark:bg-emerald-950/50">
          <svg className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Quiz created! Share the link below to start collecting responses.
          </p>
        </div>
      )}

      {/* Quiz list */}
      <div className="mt-8">
        {userQuizzes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-violet/30 bg-surface-violet p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet/10">
              <svg className="h-8 w-8 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="mt-4 text-lg font-bold">No quizzes yet</p>
            <p className="mt-2 text-muted-foreground">
              Create your first quiz and share it with friends to see how they
              perceive you.
            </p>
            <Link
              href="/create"
              className="gradient-brand mt-6 inline-block rounded-full px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userQuizzes.map((quiz) => {
              const isReady = quiz.responseCount >= 3;
              return (
                <div
                  key={quiz.id}
                  className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md"
                >
                  {/* Top row: title + meta + action */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold truncate">
                          {quiz.title ?? "My Quiz"}
                        </h3>
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isReady
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-violet/10 text-violet"
                        }`}>
                          {isReady ? (
                            <>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {quiz.responseCount} responses
                            </>
                          ) : (
                            <>{quiz.responseCount}/3 responses</>
                          )}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Created {formatRelativeDate(quiz.createdAt)}
                      </p>
                    </div>
                    {isReady && (
                      <Link
                        href={`/dashboard/${quiz.id}/results`}
                        className="gradient-brand shrink-0 rounded-full px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
                      >
                        View Results
                      </Link>
                    )}
                  </div>

                  {/* Progress bar for responses */}
                  {!isReady && (
                    <div className="mt-3">
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full gradient-brand transition-all duration-300"
                          style={{ width: `${Math.min(100, (quiz.responseCount / 3) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {3 - quiz.responseCount} more response{3 - quiz.responseCount !== 1 ? "s" : ""} needed to unlock results
                      </p>
                    </div>
                  )}

                  {/* Share section — collapsible-style, compact */}
                  <details className="mt-3 group" open={justCreated === quiz.slug}>
                    <summary className="cursor-pointer text-sm font-medium text-violet hover:text-violet/80 transition-colors list-none flex items-center gap-1.5">
                      <svg className="h-4 w-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      Share quiz link
                    </summary>
                    <div className="mt-2">
                      <ShareLink slug={quiz.slug} />
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
