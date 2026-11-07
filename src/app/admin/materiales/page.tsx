import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";

type Row = { id: string; title: string; is_published: boolean; is_free: boolean; price_cents: number; area: string; categories: { name: string } | null };

export default async function Materiales() {
  const sb = await createClient();
  const me = (await getUser())?.id ?? "";
  const { data } = await sb.from("products").select("id,title,is_published,is_free,price_cents,area,categories(name)").eq("created_by", me).order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  return (
    <>
      <div className="adm-top"><h1>Materiales</h1><Link className="btn btn-honey" href="/admin/materiales/nuevo">+ Nuevo material</Link></div>
      <div className="adm-c" style={{ overflowX: "auto" }}>
        {rows.length === 0 ? <p style={{ margin: 0 }}>Aún no hay materiales. Crea el primero.</p> : (
          <table className="adm-t">
            <thead><tr><th>Título</th><th>Terapia</th><th>Área</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><b>{p.title}</b></td>
                  <td>{p.categories?.name ?? "—"}</td>
                  <td>{p.area === "clinica" ? "Clínica" : "Educativa"}</td>
                  <td>{p.is_free || p.price_cents === 0 ? "Gratis" : `S/ ${(p.price_cents / 100).toFixed(2)}`}</td>
                  <td><span className={`adm-st ${p.is_published ? "ok" : ""}`}>{p.is_published ? "Publicado" : "Borrador"}</span></td>
                  <td><Link href={`/admin/materiales/${p.id}`} style={{ color: "var(--cacao)", fontWeight: 800, textDecoration: "underline" }}>Editar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
