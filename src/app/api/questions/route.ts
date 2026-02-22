import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { asc, eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  // Get the active question set
  const activeSet = await db
    .select({ id: schema.questionSets.id })
    .from(schema.questionSets)
    .where(eq(schema.questionSets.isActive, true))
    .limit(1);

  if (activeSet.length === 0) {
    return NextResponse.json({ error: "No active question set" }, { status: 500 });
  }

  const questionSetId = activeSet[0]!.id;

  const questions = await db
    .select({
      id: schema.questions.id,
      category: schema.questions.category,
      textSelf: schema.questions.textSelf,
      textFriend: schema.questions.textFriend,
      sortOrder: schema.questions.sortOrder,
    })
    .from(schema.questions)
    .where(eq(schema.questions.questionSetId, questionSetId))
    .orderBy(asc(schema.questions.sortOrder));

  return NextResponse.json({ questions, questionSetId });
}
