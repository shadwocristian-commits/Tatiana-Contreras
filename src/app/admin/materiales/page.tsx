import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import MaterialesLista, { type Fila } from "@/components/MaterialesLista";

export default async function Materiales() {
  const sb = await createClient();
  const me = (await getUser())?.id ?? "";
  const { data } = await sb.from("products").select("id,title,status,is_free,price_cents,area,cover_url,gallery,file_path,categories(name)").eq("created_by", me).order("created_at", { ascending: false });
  return (
    <>
      <div className="adm-top"><h1>Materiales</h1><Link className="btn btn-honey" href="/admin/materiales/nuevo">+ Nuevo material</Link></div>
      <MaterialesLista rows={(data ?? []) as unknown as Fila[]} />
    </>
  );
}
