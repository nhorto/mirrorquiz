import { eq, and } from "drizzle-orm";
import type { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Move everything owned by an anonymous (guest) user to a real account.
 * Idempotent: re-running after a successful migration is a no-op.
 */
export async function migrateAnonymousUserData(
  db: DB,
  anonymousUserId: string,
  targetUserId: string
): Promise<void> {
  if (anonymousUserId === targetUserId) return;

  await db
    .update(schema.quizzes)
    .set({ userId: targetUserId })
    .where(eq(schema.quizzes.userId, anonymousUserId));

  await db
    .update(schema.purchases)
    .set({ userId: targetUserId })
    .where(eq(schema.purchases.userId, anonymousUserId));
}

/**
 * Attach any quizzes created under an anonymous session to the user who just
 * signed in, based on the email they entered at the end of the quiz.
 *
 * Called from Better Auth's session.create.after database hook, so it covers
 * the case where the magic link is opened in a different browser than the one
 * the quiz was taken in (the in-app-browser scenario).
 */
export async function claimPendingQuizzes(db: DB, userId: string): Promise<void> {
  const userRows = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      isAnonymous: schema.users.isAnonymous,
    })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  const user = userRows[0];
  if (!user || user.isAnonymous) return;

  const claims = await db
    .select()
    .from(schema.quizClaims)
    .where(eq(schema.quizClaims.email, user.email.toLowerCase()));

  if (claims.length === 0) return;

  for (const claim of claims) {
    if (claim.anonymousUserId === userId) continue;

    // Carry the name the visitor entered during the quiz over to the real
    // account, so they skip the onboarding step.
    if (!user.name?.trim()) {
      const anonRows = await db
        .select({ name: schema.users.name })
        .from(schema.users)
        .where(eq(schema.users.id, claim.anonymousUserId))
        .limit(1);
      const anonName = anonRows[0]?.name?.trim();
      if (anonName) {
        await db
          .update(schema.users)
          .set({ name: anonName })
          .where(eq(schema.users.id, userId));
      }
    }

    await migrateAnonymousUserData(db, claim.anonymousUserId, userId);

    // Deleting the anonymous user cascades its sessions and this claim row.
    // The isAnonymous guard ensures we never delete a real account.
    await db
      .delete(schema.users)
      .where(
        and(
          eq(schema.users.id, claim.anonymousUserId),
          eq(schema.users.isAnonymous, true)
        )
      );
  }
}
