"use client";

import posthog from "posthog-js";

let initialized = false;

const CONSENT_KEY = "pq_cookie_consent";

function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

/**
 * Initialize PostHog for every visitor, immediately.
 *
 * Without consent we run in anonymous mode: persistence is sessionStorage
 * (tab-scoped, dies when the tab closes, nothing written to cookies or
 * localStorage) and no person profiles are created. That's enough to see
 * pageviews and stitch the funnel within a visit — which is the whole point
 * of issue #4: before this, PostHog only initialized after cookie-banner
 * Accept, making most mobile visitors invisible.
 *
 * When the visitor accepts the banner, we upgrade persistence to
 * localStorage+cookie so they're recognized across visits, and identified
 * tracking (identifyUser) becomes allowed.
 */
export function initPostHog() {
  if (initialized || typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key) return;

  posthog.init(key, {
    api_host: host ?? "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: hasConsent() ? "localStorage+cookie" : "sessionStorage",
    person_profiles: "identified_only",
  });

  initialized = true;
}

/** Called when the visitor accepts or declines the cookie banner. */
export function setAnalyticsConsent(granted: boolean) {
  if (!initialized || typeof window === "undefined") return;
  posthog.set_config({
    persistence: granted ? "localStorage+cookie" : "sessionStorage",
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

/** Identified tracking stays consent-gated. */
export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === "undefined" || !hasConsent()) return;
  posthog.identify(userId, traits);
}

export { posthog };

/* ─── Meta Pixel helpers ─── */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbqTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
}

export function fbqTrackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", event, params);
}
