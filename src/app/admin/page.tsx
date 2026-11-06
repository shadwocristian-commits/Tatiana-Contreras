import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { moderateReview } from "@/app/actions";

export const metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

export default async function Admin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/ingresar?next=/admin");
  const { data: prof } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "admin") notFound();

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: pending } = await sb.from("reviews").select("id,author_name,rating,comment,products(title)").eq("status", "pending").order("created_at");
  const { count: nProd } = await sb.from("products").select("*", { count: "exact", head: true });
  const { count: nDl } = await sb.from("downloads").select("*", { count: "exact", head: true });
  const { count: nUsers } = await sb.from("profiles").select("*", { count: "exact", head: true });
  const { data: dls } = await sb.from("downloads").select("created_at").gte("created_at", since);
  const { data: cats } = await sb.from("categories").select("id,name").order("sort");
  const { data: prods } = await sb.from("products").select("category_id");
  const rows = (pending ?? []) as unknown as { id: string; author_name: string; rating: number; comment: string; products: { title: string } | null }[];

  // Descargas por día (últimos 14 días)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const perDay = days.map((d) => (dls ?? []).filter((x: { created_at: string }) => x.created_at.slice(0, 10) === d).length);
  const max = Math.max(1, ...perDay);
  const byCat = (cats ?? []).map((c: { id: string; name: string }) => ({ name: c.name, n: (prods ?? []).filter((p: { category_id: string | null }) => p.category_id === c.id).length }));

  return (
    <div className="adm">
      <aside className="adm-s" aria-label="Menú del panel">
        <b>Panel Tatiana</b>
        <a className="on" href="/admin">Resumen</a>
        <span className="off">Materiales (pronto)</span>
        <span className="off">Usuarios (pronto)</span>
        <span className="off">Pagos (apagado)</span>
        <Link href="/tienda" style={{ marginTop: "auto" }}>← Ver tienda</Link>
      </aside>
      <div className="adm-m">
        <h1 style={{ fontSize: 40 }}>Resumen</h1>
        <div className="adm-k">
          <div className="adm-c"><small>Materiales</small><span className="v" style={{ color: "var(--honey)" }}>{nProd ?? 0}</span></div>
          <div className="adm-c"><small>Descargas</small><span className="v" style={{ color: "var(--sage)" }}>{nDl ?? 0}</span></div>
          <div className="adm-c"><small>Opiniones por revisar</small><span className="v" style={{ color: "var(--coral)" }}>{rows.length}</span></div>
          <div className="adm-c"><small>Usuarios</small><span className="v" style={{ color: "var(--sky)" }}>{nUsers ?? 0}</span></div>
        </div>
        <div className="adm-2">
          <div className="adm-c">
            <h2 style={{ fontSize: 22 }}>Descargas · últimos 14 días</h2>
            <div className="adm-bars" role="img" aria-label="Descargas por día">
              {perDay.map((n, i) => <i key={days[i]} className={n === max && n > 0 ? "hi" : ""} style={{ height: `${(n / max) * 100}%` }} title={`${days[i]}: ${n}`} />)}
            </div>
          </div>
          <div className="adm-c">
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Por tipo de terapia</h2>
            {byCat.map((c) => <div key={c.name} className="adm-l"><span>{c.name}</span><b>{c.n}</b></div>)}
          </div>
        </div>
        <div className="adm-c">
          <h2 style={{ fontSize: 22 }}>Opiniones pendientes</h2>
          {rows.length === 0 && <p style={{ color: "#cdbca6" }}>No hay opiniones pendientes.</p>}
          {rows.map((r) => (
            <form key={r.id} action={moderateReview} className="adm-r">
              <input type="hidden" name="id" value={r.id} />
              <div><b>{r.author_name}</b> · <span style={{ color: "var(--honey)" }}>{"★".repeat(r.rating)}</span> · {r.products?.title}</div>
              <p style={{ margin: 0 }}>{r.comment}</p>
              <textarea name="reply" rows={2} placeholder="Respuesta de Tatiana (opcional)" />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ok" name="status" value="approved">Aprobar</button>
                <button className="btn" name="status" value="rejected">Rechazar</button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
