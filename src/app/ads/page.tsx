import type { Metadata } from "next";
import { AdsClient } from "./ads-client";

export const metadata: Metadata = {
  title: "MirrorQuiz Ad Creatives",
  robots: "noindex, nofollow",
};

export default function AdsPage() {
  return <AdsClient />;
}
