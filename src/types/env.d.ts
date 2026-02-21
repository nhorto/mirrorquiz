interface CloudflareEnv {
  DB: D1Database;
  OG_CACHE: KVNamespace;
  ENVIRONMENT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  APP_URL?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENVIRONMENT?: string;
    }
  }
}
