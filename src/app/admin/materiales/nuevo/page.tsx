import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";
import type { Category } from "@/lib/types";

export default async function Nuevo() {
  const sb = await createClient();
  const { data } = await sb.from("categories").select("id,slug,name").order("sort");
  return (<><div className="adm-top"><h1>Nuevo material</h1></div><ProductForm categories={(data ?? []) as (Category & { id: string })[]} /></>);
}
