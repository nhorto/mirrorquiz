"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/analytics";
import { CookieConsent, useCookieConsent } from "@/components/cookie-consent";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { consent, grant, deny } = useCookieConsent();

  useEffect(() => {
    if (consent === true) {
      initPostHog();
    }
  }, [consent]);

  return (
    <>
      {children}
      {consent === null && (
        <CookieConsent onAccept={grant} onDecline={deny} />
      )}
    </>
  );
}
