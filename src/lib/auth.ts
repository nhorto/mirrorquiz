import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";
import * as schema from "@/db/schema";

async function createAuth() {
  const { env } = await getCloudflareContext({ async: true });
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.APP_URL ?? "http://localhost:8787",
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
    }),
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          const apiKey = env.RESEND_API_KEY;
          if (!apiKey) {
            console.log(`[DEV] Magic link for ${email}: ${url}`);
            return;
          }
          const resend = new Resend(apiKey);
          await resend.emails.send({
            from: "MirrorQuiz <noreply@mirrorquiz.com>",
            to: email,
            subject: "Your sign-in link",
            html: `
              <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                <h2>Sign in to MirrorQuiz</h2>
                <p>Click the button below to sign in. This link expires in 10 minutes.</p>
                <a href="${url}" style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Sign In
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                  If you didn't request this link, you can safely ignore this email.
                </p>
              </div>
            `,
          });
        },
        expiresIn: 600,
        disableSignUp: false,
      }),
      nextCookies(),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh daily
    },
    trustedOrigins: [
      env.APP_URL ?? "http://localhost:8787",
      "http://localhost:3000",
      "http://localhost:8787",
      "https://www.mirrorquiz.com",
    ],
  });
}

// Promise-based singleton to prevent double initialization
let authPromise: ReturnType<typeof createAuth> | null = null;

export function initAuth() {
  if (!authPromise) {
    authPromise = createAuth();
  }
  return authPromise;
}

// Static export for Better Auth CLI (never called at runtime)
export const auth = betterAuth({
  database: drizzleAdapter({} as any, {
    provider: "sqlite",
    usePlural: true,
  }),
  plugins: [
    magicLink({
      sendMagicLink: async () => {},
    }),
  ],
});
