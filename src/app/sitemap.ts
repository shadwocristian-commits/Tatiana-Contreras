import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
const base = "https://tatiana-contreras-psicologa.vercel.app";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = await createClient();
  const { data } = await sb.from("products").select("slug,created_at").eq("is_published", true);
  const fixed = ["", "/tienda", "/info/terminos", "/info/privacidad"].map((p) => ({ url: base + p }));
  return [...fixed, ...(data ?? []).map((r: { slug: string; created_at: string }) => ({ url: `${base}/tienda/productos/${r.slug}`, lastModified: r.created_at }))];
}
