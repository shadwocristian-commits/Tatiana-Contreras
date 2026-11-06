import { notFound, redirect } from "next/navigation";
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

  const { data: pending } = await sb.from("reviews").select("id,author_name,rating,comment,products(title)").eq("status", "pending").order("created_at");
  const { count: nProd } = await sb.from("products").select("*", { count: "exact", head: true });
  const { count: nDl } = await sb.from("downloads").select("*", { count: "exact", head: true });
  const rows = (pending ?? []) as unknown as { id: string; author_name: string; rating: number; comment: string; products: { title: string } | null }[];

  return (
    <div className="wrap" style={{ padding: "28px 28px 56px" }}>
      <h1 style={{ fontSize: 44 }}>Panel</h1>
      <div className="trust" style={{ margin: "16px 0" }}>
        <div className="panel-card"><b style={{ fontSize: 28 }}>{nProd ?? 0}</b><br />Materiales</div>
        <div className="panel-card"><b style={{ fontSize: 28 }}>{nDl ?? 0}</b><br />Descargas</div>
        <div className="panel-card"><b style={{ fontSize: 28 }}>{rows.length}</b><br />Opiniones por revisar</div>
      </div>
      <h2>Opiniones pendientes</h2>
      {rows.length === 0 && <p>No hay opiniones pendientes.</p>}
      {rows.map((r) => (
        <form key={r.id} action={moderateReview} className="panel-card" style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <input type="hidden" name="id" value={r.id} />
          <div><b>{r.author_name}</b> · {r.rating} ★ · {r.products?.title}</div>
          <p style={{ margin: 0 }}>{r.comment}</p>
          <textarea name="reply" rows={2} placeholder="Respuesta de Tatiana (opcional)" />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-pri" name="status" value="approved">Aprobar</button>
            <button className="btn" name="status" value="rejected">Rechazar</button>
          </div>
        </form>
      ))}
    </div>
  );
}
