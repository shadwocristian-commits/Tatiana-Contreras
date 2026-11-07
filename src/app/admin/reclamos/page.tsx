import { createClient } from "@/lib/supabase/server";
import ReclamosAdmin, { type Rec } from "@/components/ReclamosAdmin";

export default async function Reclamos() {
  const sb = await createClient();
  const { data } = await sb.from("reclamos").select("*").order("created_at", { ascending: false });
  return (<><div className="adm-top"><h1>Libro de Reclamaciones</h1></div><ReclamosAdmin rows={(data ?? []) as Rec[]} /></>);
}
