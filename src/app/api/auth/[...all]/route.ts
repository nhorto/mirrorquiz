import { initAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const auth = await initAuth();
  const handler = toNextJsHandler(auth);
  return handler.GET!(request);
}

export async function POST(request: Request) {
  // Rate limit magic link requests (3 per 15 min per IP)
  const url = new URL(request.url);
  if (url.pathname.includes("magic-link")) {
    const { env } = await getCloudflareContext({ async: true });
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      const ip =
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for") ??
        "unknown";
      const result = await checkRateLimit(
        "magicLink",
        ip,
        env.UPSTASH_REDIS_REST_URL,
        env.UPSTASH_REDIS_REST_TOKEN
      );
      if (!result.success) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Try again later." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  const auth = await initAuth();
  const handler = toNextJsHandler(auth);
  return handler.POST!(request);
}
