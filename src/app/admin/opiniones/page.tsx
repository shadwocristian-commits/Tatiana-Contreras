import { createClient } from "@/lib/supabase/server";
import { moderateReview } from "@/app/actions";

export default async function Opiniones() {
  const sb = await createClient();
  const { data } = await sb.from("reviews").select("id,author_name,rating,comment,products(title)").eq("status", "pending").order("created_at");
  const rows = (data ?? []) as unknown as { id: string; author_name: string; rating: number; comment: string; products: { title: string } | null }[];
  return (
    <>
      <div className="adm-top"><h1>Opiniones pendientes</h1></div>
      <div className="adm-c">
        {rows.length === 0 && <p style={{ margin: 0 }}>No hay opiniones pendientes.</p>}
        {rows.map((r) => (
          <form key={r.id} action={moderateReview} className="adm-r">
            <input type="hidden" name="id" value={r.id} />
            <div><b>{r.author_name}</b> · <span style={{ color: "#D9A400" }}>{"★".repeat(r.rating)}</span> · {r.products?.title}</div>
            <p style={{ margin: 0 }}>{r.comment}</p>
            <textarea name="reply" rows={2} placeholder="Respuesta de Tatiana (opcional)" />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ok" name="status" value="approved">Aprobar</button>
              <button className="btn" name="status" value="rejected">Rechazar</button>
            </div>
          </form>
        ))}
      </div>
    </>
  );
}
