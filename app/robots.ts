import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/partner/"],
    },
    sitemap: "https://www.cashall.in/sitemap.xml",
  };
}
