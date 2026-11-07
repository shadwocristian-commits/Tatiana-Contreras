import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCategorias, getPagosActivos } from "@/lib/publico";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/types";

export const metadata = { title: "Tienda de materiales" };
export const dynamic = "force-dynamic";

type SP = { area?: string; cat?: string; q?: string; gratis?: string };

export default async function Tienda({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const sb = await createClient();
  const [payments, cats] = await Promise.all([getPagosActivos(), getCategorias()]);
  const categories = cats as (Category & { id: string })[];

  let query = sb.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false });
  if (sp.area === "clinica" || sp.area === "educativa") query = query.eq("area", sp.area);
  const cat = categories.find((c) => c.slug === sp.cat);
  if (cat) query = query.eq("category_id", cat.id);
  if (sp.gratis === "1") query = query.or("is_free.eq.true,price_cents.eq.0");
  const q = (sp.q ?? "").trim().replace(/[%,()]/g, " ");
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  const { data } = await query;
  const products = (data ?? []) as Product[];

  const href = (o: Partial<SP>) => {
    const p = new URLSearchParams();
    const m = { ...sp, ...o };
    Object.entries(m).forEach(([k, v]) => v && p.set(k, v));
    return `/tienda${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <div className="wrap">
      <div style={{ padding: "28px 0 0", fontSize: 14 }}><Link href="/">Inicio</Link> / <b>Tienda</b></div>
      <h1 style={{ fontSize: 48, marginTop: 8 }}>Materiales</h1>
      <div className="shop">
        <aside className="filters" aria-label="Filtros">
          <h3>Área</h3>
          <Link className={!sp.area ? "on" : ""} href={href({ area: undefined })}>Todas</Link>
          <Link className={sp.area === "clinica" ? "on" : ""} href={href({ area: "clinica" })}>Clínica</Link>
          <Link className={sp.area === "educativa" ? "on" : ""} href={href({ area: "educativa" })}>Educativa</Link>
          <h3>Tipo de terapia</h3>
          {categories.map((c) => (
            <Link key={c.slug} className={sp.cat === c.slug ? "on" : ""} href={href({ cat: sp.cat === c.slug ? undefined : c.slug })}>{c.name}</Link>
          ))}
          <h3>Precio</h3>
          <Link className={sp.gratis === "1" ? "on" : ""} href={href({ gratis: sp.gratis === "1" ? undefined : "1" })}>Solo gratis</Link>
        </aside>
        <section className="catalog">
          <form action="/tienda" style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }} role="search">
            {sp.area && <input type="hidden" name="area" value={sp.area} />}
            <label htmlFor="q" style={{ position: "absolute", left: -9999 }}>Buscar</label>
            <div className="searchbar" style={{ flex: 1, minWidth: 240 }}>
              <input id="q" name="q" defaultValue={sp.q} placeholder="Buscar por tema o título" />
              <button className="btn btn-pri" style={{ minHeight: 44 }}>Buscar</button>
            </div>
          </form>
          {products.length === 0 ? (
            <div className="box">No encontramos materiales con esos filtros. <Link href="/tienda" style={{ fontWeight: 800 }}>Ver todos</Link></div>
          ) : (
            <div className="grid3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
              {products.map((p) => <ProductCard key={p.id} p={p} payments={payments} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
