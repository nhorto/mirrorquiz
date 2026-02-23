"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "pq_cookie_consent";

export function useCookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "granted") setConsent(true);
    else if (stored === "denied") setConsent(false);
    // null = not yet decided
  }, []);

  function grant() {
    localStorage.setItem(CONSENT_KEY, "granted");
    setConsent(true);
  }

  function deny() {
    localStorage.setItem(CONSENT_KEY, "denied");
    setConsent(false);
  }

  return { consent, grant, deny };
}

export function CookieConsent({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 shadow-lg">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies for analytics to improve your experience.{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
