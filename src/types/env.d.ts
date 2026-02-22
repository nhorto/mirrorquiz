/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    OG_CACHE: KVNamespace;
    ENVIRONMENT: string;
    BETTER_AUTH_SECRET: string;
    RESEND_API_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    APP_URL?: string;
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
  }

  namespace NodeJS {
    interface ProcessEnv {
      ENVIRONMENT?: string;
      NEXT_PUBLIC_APP_URL?: string;
      APP_URL?: string;
    }
  }
}

export {};
