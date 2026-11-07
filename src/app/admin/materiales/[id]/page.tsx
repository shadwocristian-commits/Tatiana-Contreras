import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import type { Category, Product } from "@/lib/types";

export default async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const me = (await getUser())?.id ?? "";
  const { data: p } = await sb.from("products").select("*").eq("id", id).eq("created_by", me).maybeSingle();
  if (!p) notFound();
  const { data } = await sb.from("categories").select("id,slug,name").order("sort");
  return (<><div className="adm-top"><h1>Editar material</h1></div><ProductForm categories={(data ?? []) as (Category & { id: string })[]} product={p as Product & { category_id: string | null; is_published: boolean }} /></>);
}
