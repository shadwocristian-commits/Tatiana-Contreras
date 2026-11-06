import type { MetadataRoute } from "next";
const base = "https://tatiana-contreras.vercel.app";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/cuenta", "/auth"] }], sitemap: `${base}/sitemap.xml` };
}
