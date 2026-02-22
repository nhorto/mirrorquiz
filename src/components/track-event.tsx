"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function TrackEvent({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackEvent(event, properties);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
