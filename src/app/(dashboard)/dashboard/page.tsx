import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import * as schema from "@/db/schema";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { ShareLink } from "@/components/share-link";

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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {session.user.name ?? session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            New Quiz
          </Link>
          <SignOutButton />
        </div>
      </div>

      {/* Just created banner */}
      {justCreated && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/50">
          <p className="font-medium text-emerald-800 dark:text-emerald-200">
            Quiz created! Share this link with friends:
          </p>
          <ShareLink slug={justCreated} />
        </div>
      )}

      {/* Quiz list */}
      <div className="mt-8">
        {userQuizzes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-lg font-medium">No quizzes yet</p>
            <p className="mt-2 text-muted-foreground">
              Create your first quiz and share it with friends to see how they
              perceive you.
            </p>
            <Link
              href="/create"
              className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {quiz.title ?? `Quiz`}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {quiz.responseCount} response
                      {quiz.responseCount !== 1 ? "s" : ""} &middot; Created{" "}
                      {quiz.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {quiz.responseCount >= 3 && (
                      <Link
                        href={`/dashboard/${quiz.id}/results`}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        View Results
                      </Link>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <ShareLink slug={quiz.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
