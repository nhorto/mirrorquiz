import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL ?? "https://mirrorquiz.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/create/", "/api/", "/purchase/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
