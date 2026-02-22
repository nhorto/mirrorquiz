import { Resend } from "resend";
import { eq, and } from "drizzle-orm";
import type { Database } from "@/db";
import * as schema from "@/db/schema";

interface NotificationContext {
  db: Database;
  resendApiKey?: string;
  appUrl: string;
}

/**
 * Only send emails at meaningful milestones instead of every response.
 * This reduces email volume by ~90% at scale.
 */
const NOTIFICATION_MILESTONES = [1, 3, 10, 25, 50, 100, 250, 500, 1000];

function isMilestone(count: number): boolean {
  return NOTIFICATION_MILESTONES.includes(count);
}

function getMilestoneMessage(
  name: string,
  count: number,
  resultsUrl: string
): { subject: string; html: string } | null {
  if (count === 1) {
    return {
      subject: "Your first response is in!",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2>Hey ${name}!</h2>
          <p>Someone just completed your perception quiz. You have <strong>1 response</strong> so far.</p>
          <p>You need <strong>2 more</strong> before your results unlock. Keep sharing your link!</p>
        </div>
      `,
    };
  }

  if (count === 3) {
    // This case is handled separately as "results_ready" — return null here
    return null;
  }

  if (count === 10) {
    return {
      subject: "10 people have shared their perception of you!",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2>Hey ${name}!</h2>
          <p>You've hit <strong>10 responses</strong> — your results are getting more accurate with every response.</p>
          <a href="${resultsUrl}" style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Your Results
          </a>
        </div>
      `,
    };
  }

  // Generic milestone (25, 50, 100, 250, 500, 1000)
  return {
    subject: `${count} people have responded to your quiz!`,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2>Hey ${name}!</h2>
        <p>You've reached <strong>${count} responses</strong> on your perception quiz!</p>
        <a href="${resultsUrl}" style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Your Results
        </a>
      </div>
    `,
  };
}

export async function notifyNewResponse(
  ctx: NotificationContext,
  quizId: string,
  newCount: number
) {
  // Skip non-milestone counts (this is the key optimization)
  if (!isMilestone(newCount)) return;

  // Get quiz + creator info
  const results = await ctx.db
    .select({
      quizSlug: schema.quizzes.slug,
      userId: schema.quizzes.userId,
      creatorEmail: schema.users.email,
      creatorName: schema.users.name,
    })
    .from(schema.quizzes)
    .innerJoin(schema.users, eq(schema.quizzes.userId, schema.users.id))
    .where(eq(schema.quizzes.id, quizId))
    .limit(1);

  const quiz = results[0];
  if (!quiz) return;

  // Check if we already sent a "results_ready" notification for this quiz
  const alreadySentReady = await ctx.db
    .select({ id: schema.emailNotifications.id })
    .from(schema.emailNotifications)
    .where(
      and(
        eq(schema.emailNotifications.quizId, quizId),
        eq(schema.emailNotifications.type, "results_ready")
      )
    )
    .limit(1);

  // Determine notification type
  const isResultsReady = newCount === 3 && alreadySentReady.length === 0;
  const type = isResultsReady ? "results_ready" : "new_response";

  if (!ctx.resendApiKey) {
    console.log(`[DEV] Notification (${type}) for ${quiz.creatorEmail}: ${newCount} responses`);
    return;
  }

  const resend = new Resend(ctx.resendApiKey);
  const name = quiz.creatorName ?? "there";
  const resultsUrl = `${ctx.appUrl}/dashboard`;

  if (isResultsReady) {
    await resend.emails.send({
      from: "MirrorQuiz <noreply@mirrorquiz.com>",
      to: quiz.creatorEmail,
      subject: "Your results are ready!",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2>Hey ${name}, your results are in!</h2>
          <p>You've got <strong>${newCount} responses</strong> — that's enough to see your results.</p>
          <a href="${resultsUrl}" style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Your Results
          </a>
        </div>
      `,
    });

    // Record that we sent this notification
    const { nanoid } = await import("nanoid");
    await ctx.db.insert(schema.emailNotifications).values({
      id: nanoid(21),
      userId: quiz.userId,
      quizId,
      type: "results_ready",
    });
  } else {
    // Send milestone notification
    const message = getMilestoneMessage(name, newCount, resultsUrl);
    if (!message) return;

    await resend.emails.send({
      from: "MirrorQuiz <noreply@mirrorquiz.com>",
      to: quiz.creatorEmail,
      ...message,
    });
  }
}
