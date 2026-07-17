import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, anonymous } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import * as schema from "@/db/schema";
import { claimPendingQuizzes, migrateAnonymousUserData } from "@/lib/claim";

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
      anonymous({
        emailDomainName: "anon.mirrorquiz.com",
        // Same-browser link: magic link opened in the browser that still
        // holds the anonymous session. Migrate before the plugin deletes
        // the anonymous user (quizzes cascade-delete otherwise).
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          await migrateAnonymousUserData(db, anonymousUser.user.id, newUser.user.id);
          if (!newUser.user.name?.trim() && anonymousUser.user.name?.trim()) {
            await db
              .update(schema.users)
              .set({ name: anonymousUser.user.name })
              .where(eq(schema.users.id, newUser.user.id));
          }
        },
      }),
      nextCookies(),
    ],
    databaseHooks: {
      session: {
        create: {
          // Cross-browser link: the magic link was opened in a different
          // browser than the quiz was taken in (common inside TikTok/FB
          // in-app browsers). Claims are keyed by email, so they resolve
          // wherever the user signs in.
          after: async (session) => {
            try {
              await claimPendingQuizzes(db, session.userId);
            } catch (err) {
              console.error("Failed to claim pending quizzes:", err);
            }
          },
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh daily
    },
    trustedOrigins: [
      env.APP_URL ?? "http://localhost:8787",
      "http://localhost:3000",
      "http://localhost:8787",
      "https://mirrorquiz.com",
      "https://www.mirrorquiz.com",
      // wrangler dev simulates the production custom domain over plain http,
      // so local requests arrive with an http://mirrorquiz.com origin.
      ...(env.ENVIRONMENT !== "production"
        ? ["http://mirrorquiz.com", "http://www.mirrorquiz.com"]
        : []),
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
    anonymous(),
  ],
});
