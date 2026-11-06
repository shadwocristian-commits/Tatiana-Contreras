import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icons";
import { createClient, getUser } from "@/lib/supabase/server";

export const metadata = { title: "Mis materiales" };
export const dynamic = "force-dynamic";

type Row = { id: string; products: { id: string; slug: string; title: string; format: string | null } | null; orders: { created_at: string } | null };

export default async function MisCompras({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { aviso } = await searchParams;
  const sb = await createClient();
  const user = await getUser();
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
      {aviso && <div className="msg msg-err" role="alert" style={{ marginTop: 14 }}><Icon n="info" />{aviso.slice(0, 160)}</div>}
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
