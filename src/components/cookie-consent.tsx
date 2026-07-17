"use client";

import { useCallback, useSyncExternalStore } from "react";

const CONSENT_KEY = "pq_cookie_consent";
const CONSENT_EVENT = "pq-consent-change";

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// null = not yet decided
function getSnapshot(): boolean | null {
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "granted") return true;
  if (stored === "denied") return false;
  return null;
}

export function useCookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const grant = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "granted");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }, []);

  const deny = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "denied");
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }, []);

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
          We use anonymous, session-only analytics to see how the site is
          used. Allow cookies so we can remember you across visits?{" "}
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
