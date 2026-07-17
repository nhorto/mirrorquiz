"use client";

import { useEffect } from "react";
import { initPostHog, setAnalyticsConsent } from "@/lib/analytics";
import { CookieConsent, useCookieConsent } from "@/components/cookie-consent";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { consent, grant, deny } = useCookieConsent();

  // Initialize immediately for everyone — anonymous/sessionStorage mode
  // until the visitor makes a choice on the banner.
  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (consent !== null) {
      setAnalyticsConsent(consent);
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
