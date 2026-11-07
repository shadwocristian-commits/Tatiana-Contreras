import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MaterialesLista, { type Fila } from "@/components/MaterialesLista";

export default async function Materiales() {
  const sb = await createClient();
  const { data } = await sb.from("products").select("id,title,status,is_free,price_cents,area,cover_url,gallery,file_path,created_by,categories(name)").order("created_at", { ascending: false });
  const ids = [...new Set((data ?? []).map((r: { created_by: string | null }) => r.created_by).filter(Boolean))] as string[];
  const { data: ps } = ids.length ? await sb.from("profiles").select("id,full_name").in("id", ids) : { data: [] };
  const names = new Map((ps ?? []).map((x: { id: string; full_name: string | null }) => [x.id, x.full_name ?? "—"]));
  const rows = ((data ?? []) as unknown as Fila[]).map((r) => ({ ...r, autor: names.get(r.created_by ?? "") ?? "—" }));
  return (
    <>
      <div className="adm-top"><h1>Materiales</h1><Link className="btn btn-honey" href="/admin/materiales/nuevo">+ Nuevo material</Link></div>
      <MaterialesLista rows={rows} />
    </>
  );
}
