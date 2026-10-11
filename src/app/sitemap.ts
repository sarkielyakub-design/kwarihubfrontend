import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kwarihub.com";
  return ["", "/shop", "/about", "/support"].map((path) => ({ url: `${base}${path}`, changeFrequency: path === "" ? "daily" : "weekly", priority: path === "" ? 1 : 0.7 }));
}
