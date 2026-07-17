"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient, anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
  plugins: [magicLinkClient(), anonymousClient()],
});

export const { signIn, signOut, useSession } = authClient;
