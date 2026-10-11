import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/shop", "/about", "/support", "/products/"] , disallow: ["/admin/", "/api/", "/account", "/checkout", "/vendor"] }, sitemap: "https://kwarihub.com/sitemap.xml" };
}
