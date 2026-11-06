import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Resumen() {
  const sb = await createClient();
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const { count: nProd } = await sb.from("products").select("*", { count: "exact", head: true });
  const { count: nDl } = await sb.from("downloads").select("*", { count: "exact", head: true });
  const { count: nUsers } = await sb.from("profiles").select("*", { count: "exact", head: true });
  const { count: nPend } = await sb.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { data: dls } = await sb.from("downloads").select("created_at").gte("created_at", since);
  const { data: cats } = await sb.from("categories").select("id,name").order("sort");
  const { data: prods } = await sb.from("products").select("category_id");

  const days = Array.from({ length: 14 }, (_, i) => new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10));
  const perDay = days.map((d) => (dls ?? []).filter((x: { created_at: string }) => x.created_at.slice(0, 10) === d).length);
  const max = Math.max(1, ...perDay);
  const byCat = (cats ?? []).map((c: { id: string; name: string }) => ({ name: c.name, n: (prods ?? []).filter((p: { category_id: string | null }) => p.category_id === c.id).length }));

  return (
    <>
      <div className="adm-top"><h1>Resumen</h1><Link className="btn btn-honey" href="/admin/materiales/nuevo">+ Nuevo material</Link></div>
      <div className="adm-k">
        <div className="adm-c"><small>Materiales</small><span className="v" style={{ color: "var(--honey)" }}>{nProd ?? 0}</span></div>
        <div className="adm-c"><small>Descargas</small><span className="v" style={{ color: "var(--sage)" }}>{nDl ?? 0}</span></div>
        <div className="adm-c"><small>Opiniones por revisar</small><span className="v" style={{ color: "var(--coral)" }}>{nPend ?? 0}</span></div>
        <div className="adm-c"><small>Usuarios</small><span className="v" style={{ color: "var(--sky)" }}>{nUsers ?? 0}</span></div>
      </div>
      <div className="adm-2">
        <div className="adm-c">
          <h2>Descargas · últimos 14 días</h2>
          <div className="adm-bars" role="img" aria-label="Descargas por día">
            {perDay.map((n, i) => <i key={days[i]} className={n === max && n > 0 ? "hi" : ""} style={{ height: `${(n / max) * 100}%` }} title={`${days[i]}: ${n}`} />)}
          </div>
        </div>
        <div className="adm-c">
          <h2 style={{ marginBottom: 8 }}>Por tipo de terapia</h2>
          {byCat.map((c) => <div key={c.name} className="adm-l"><span>{c.name}</span><b>{c.n}</b></div>)}
        </div>
      </div>
      {(nPend ?? 0) > 0 && <div className="adm-c"><b>Tienes {nPend} {nPend === 1 ? "opinión" : "opiniones"} por revisar.</b> <Link href="/admin/opiniones" style={{ color: "var(--honey)", fontWeight: 800 }}>Revisar ahora →</Link></div>}
    </>
  );
}
