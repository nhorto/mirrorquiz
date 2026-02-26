"use client";

import { useEffect } from "react";
import { trackEvent, fbqTrack, fbqTrackCustom } from "@/lib/analytics";

export function TrackEvent({
  event,
  properties,
  fbq,
}: {
  event: string;
  properties?: Record<string, unknown>;
  fbq?: { event: string; params?: Record<string, unknown>; custom?: boolean };
}) {
  useEffect(() => {
    trackEvent(event, properties);
    if (fbq) {
      if (fbq.custom) {
        fbqTrackCustom(fbq.event, fbq.params);
      } else {
        fbqTrack(fbq.event, fbq.params);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
