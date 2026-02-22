import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import * as schema from "@/db/schema";

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });

  const stripeKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    // Don't leak config state — return 200 to prevent Stripe retries
    return NextResponse.json({ received: true });
  }

  const stripe = getStripe(stripeKey);

  // Read body as text (NOT json) — signature verification needs the raw body
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    // Use async version — Workers lacks sync crypto
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const purchaseId = session.metadata?.purchaseId;
    const userId = session.metadata?.userId;
    const quizId = session.metadata?.quizId;

    if (!purchaseId || !userId || !quizId) {
      console.error("Webhook: missing required metadata fields");
      return NextResponse.json({ received: true });
    }

    const db = drizzle(env.DB, { schema });

    // Validate purchase exists, is pending, and belongs to the correct user+quiz
    const existing = await db
      .select({
        status: schema.purchases.status,
        userId: schema.purchases.userId,
        quizId: schema.purchases.quizId,
      })
      .from(schema.purchases)
      .where(
        and(
          eq(schema.purchases.id, purchaseId),
          eq(schema.purchases.userId, userId),
          eq(schema.purchases.quizId, quizId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      console.error(`Webhook: purchase ${purchaseId} not found or ownership mismatch`);
      return NextResponse.json({ received: true });
    }

    if (existing[0]!.status === "completed") {
      // Already processed, skip
      return NextResponse.json({ received: true });
    }

    if (existing[0]!.status !== "pending") {
      console.error(`Webhook: purchase ${purchaseId} in unexpected state: ${existing[0]!.status}`);
      return NextResponse.json({ received: true });
    }

    // Mark purchase as completed
    await db
      .update(schema.purchases)
      .set({
        status: "completed",
        completedAt: new Date().toISOString(),
        stripeSessionId: session.id,
      })
      .where(eq(schema.purchases.id, purchaseId));
  }

  return NextResponse.json({ received: true });
}
