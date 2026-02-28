import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://todo-hackathonphase2.vercel.app";
  return [
    {
      url: base,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/auth/login`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${base}/auth/register`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];
}
