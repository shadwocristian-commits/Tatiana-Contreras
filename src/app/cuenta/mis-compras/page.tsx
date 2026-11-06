import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Mis materiales" };
export const dynamic = "force-dynamic";

type Row = { id: string; products: { id: string; slug: string; title: string; format: string | null } | null; orders: { created_at: string } | null };

export default async function MisCompras() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/ingresar?next=/cuenta/mis-compras");
  const { data } = await sb
    .from("order_items")
    .select("id, products(id,slug,title,format), orders!inner(user_id,status,created_at)")
    .eq("orders.user_id", user.id)
    .in("orders.status", ["paid", "free"]);
  const rows = (data ?? []) as unknown as Row[];
  return (
    <div className="wrap" style={{ padding: "28px 28px 56px" }}>
      <h1 style={{ fontSize: 44 }}>Mis materiales</h1>
      {rows.length === 0 ? (
        <div className="box">Aún no tienes materiales. <Link href="/tienda" style={{ fontWeight: 800 }}>Explorar la tienda</Link></div>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {rows.map((r) => r.products && (
            <div key={r.id} className="box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <Link href={`/tienda/productos/${r.products.slug}`} style={{ fontWeight: 800 }}>{r.products.title}</Link>
                <div style={{ fontSize: 14 }}>{r.products.format}</div>
              </div>
              <a className="btn btn-pri" href={`/api/descargas/${r.products.id}`} style={{ color: "#fff" }}>Descargar</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
