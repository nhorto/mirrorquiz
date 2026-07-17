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
 * The first response is instant (the "it's working!" moment), 3 unlocks
 * results, 5 is the natural purchase moment, and the rest thin out as
 * volume grows. This keeps email volume ~90% lower than per-response
 * sends at scale.
 */
const NOTIFICATION_MILESTONES = [1, 3, 5, 10, 25, 50, 100, 250, 500, 1000];

function isMilestone(count: number): boolean {
  return NOTIFICATION_MILESTONES.includes(count);
}

const BUTTON_STYLE =
  "display: inline-block; background: linear-gradient(135deg, #8b5cf6, #d946ef); color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600;";

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
          <p>Someone just answered your quiz — you have <strong>1 response</strong> so far.</p>
          <p>You need <strong>2 more</strong> before your results unlock. Keep sharing your link!</p>
        </div>
      `,
    };
  }

  if (count === 3) {
    // This case is handled separately as "results_ready" — return null here
    return null;
  }

  if (count === 5) {
    return {
      subject: "5 friends have rated you — see what changed",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2>Hey ${name}!</h2>
          <p><strong>5 people</strong> have now shared how they see you. With this many
          perspectives, your radar chart and match score have real signal — and the
          picture may have shifted since you last looked.</p>
          <a href="${resultsUrl}" style="${BUTTON_STYLE}">
            See What Changed
          </a>
        </div>
      `,
    };
  }

  if (count === 10) {
    return {
      subject: "10 people have shared their perception of you!",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2>Hey ${name}!</h2>
          <p>You've hit <strong>10 responses</strong> — your results are getting more accurate with every response.</p>
          <a href="${resultsUrl}" style="${BUTTON_STYLE}">
            See What Changed
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
        <a href="${resultsUrl}" style="${BUTTON_STYLE}">
          See What Changed
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

  // Never email anonymous placeholder addresses (deferred-signup guests)
  if (quiz.creatorEmail.endsWith("@anon.mirrorquiz.com")) return;

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
  // Deep link straight to this quiz's results, not the dashboard
  const resultsUrl = `${ctx.appUrl}/dashboard/${quizId}/results`;

  if (isResultsReady) {
    await resend.emails.send({
      from: "MirrorQuiz <noreply@mirrorquiz.com>",
      to: quiz.creatorEmail,
      subject: "Your results are ready!",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2>Hey ${name}, your results are in!</h2>
          <p>You've got <strong>${newCount} responses</strong> — enough to see how your
          self-image compares to how your friends actually see you.</p>
          <a href="${resultsUrl}" style="${BUTTON_STYLE}">
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
