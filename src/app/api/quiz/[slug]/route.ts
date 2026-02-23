import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  const results = await db
    .select({
      quizId: schema.quizzes.id,
      slug: schema.quizzes.slug,
      title: schema.quizzes.title,
      creatorName: schema.users.name,
      creatorEmail: schema.users.email,
    })
    .from(schema.quizzes)
    .innerJoin(schema.users, eq(schema.quizzes.userId, schema.users.id))
    .where(eq(schema.quizzes.slug, slug))
    .limit(1);

  if (results.length === 0) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const row = results[0]!;
  const creatorName =
    row.creatorName && row.creatorName.trim()
      ? row.creatorName
      : row.creatorEmail?.split("@")[0] ?? "Someone";

  return NextResponse.json({
    quizId: row.quizId,
    slug: row.slug,
    title: row.title,
    creatorName,
  });
}
