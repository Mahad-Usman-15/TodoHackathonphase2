import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/auth/login", "/auth/register"],
      disallow: ["/dashboard", "/api", "/auth"],
    },
    sitemap: "https://todo-hackathonphase2.vercel.app/sitemap.xml",
  };
}
