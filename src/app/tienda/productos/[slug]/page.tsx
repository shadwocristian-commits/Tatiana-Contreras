import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { getPagosActivos } from "@/lib/publico";
import { priceLabel } from "@/lib/pagos";
import { acquireProduct } from "@/app/actions";
import ProductCard from "@/components/ProductCard";
import ReviewForm from "@/components/ReviewForm";
import { Icon } from "@/components/Icons";
import type { Product, Review } from "@/lib/types";

export const dynamic = "force-dynamic";

const stars = (n: number) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await createClient();
  const { data } = await sb.from("products").select("title,description").eq("slug", slug).eq("is_published", true).maybeSingle();
  return { title: data?.title ?? "Material", description: data?.description?.slice(0, 150) };
}

export default async function Ficha({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await createClient();
  const { data } = await sb.from("products").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!data) notFound();
  const p = data as Product;
  const [payments, user] = await Promise.all([getPagosActivos(), getUser()]);

  let owned = false;
  let reviewed = false;
  if (user) {
    const { data: it } = await sb.from("order_items").select("id, orders!inner(user_id,status)").eq("product_id", p.id).eq("orders.user_id", user.id).in("orders.status", ["paid", "free"]).limit(1);
    owned = (it?.length ?? 0) > 0;
    const { data: r } = await sb.from("reviews").select("id").eq("product_id", p.id).eq("user_id", user.id).limit(1);
    reviewed = (r?.length ?? 0) > 0;
  }
  const [{ data: rv }, { data: relData }] = await Promise.all([
    sb.from("reviews").select("*").eq("product_id", p.id).eq("status", "approved").order("created_at", { ascending: false }),
    sb.from("products").select("*").eq("is_published", true).neq("id", p.id).order("created_at", { ascending: false }).limit(4),
  ]);
  const reviews = (rv ?? []) as Review[];
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));
  const related = (relData ?? []) as Product[];
  const canBuy = !payments || p.is_free || p.price_cents === 0;

  return (
    <div className="wrap">
      <div style={{ padding: "28px 0 0", fontSize: 14 }}><Link href="/">Inicio</Link> / <Link href="/tienda">Tienda</Link> / <b>{p.title}</b></div>
      <div className="pd">
        <div className="pd-cover" style={{ flex: "1 1 520px" }}>
          {p.cover_url ? <img src={p.cover_url} alt={p.title} /> : <div className="pd-ph"><span>{p.format || "PDF"} · {p.area === "clinica" ? "Clínica" : "Educativa"}</span><b>{p.title}</b></div>}
        </div>
        <div className="pd-info">
          <span className="tag">{p.area === "clinica" ? "Clínica" : "Educativa"}{p.is_sample ? " · Ejemplo" : ""}</span>
          <h1 style={{ fontSize: 40 }}>{p.title}</h1>
          <a href="#opiniones" style={{ fontWeight: 700 }}>
            <span className="stars" aria-hidden>{stars(p.rating_avg ?? 0)}</span>{" "}
            {p.rating_count ? `${Number(p.rating_avg).toFixed(1)} · ${p.rating_count} reseñas` : "Aún sin reseñas"}
          </a>
          <div className="price">{priceLabel(p, payments)}</div>
          {owned ? (
            <a className="btn btn-pri" href={`/api/descargas/${p.id}`} style={{ color: "#fff" }}>Descargar material</a>
          ) : canBuy ? (
            <form action={acquireProduct}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="slug" value={p.slug} />
              <button className="btn btn-pri">Obtener gratis</button>
            </form>
          ) : (
            <div className="msg">Los pagos se activarán pronto.</div>
          )}
          <p style={{ lineHeight: 1.7, whiteSpace: "pre-line", margin: 0 }}>{p.description}</p>
          <div className="facts">
            <div className="fact" style={{ background: "var(--sage-l)" }}><i aria-hidden><Icon n="picture_as_pdf" /></i><div><b>{p.format || "PDF"}</b><span>imprimible en A4</span></div></div>
            <div className="fact" style={{ background: "var(--honey-l)" }}><i aria-hidden><Icon n="child_care" /></i><div><b>{p.age_range ?? "Todas"}</b><span>edades</span></div></div>
            <div className="fact" style={{ background: "#DDEEF6" }}><i aria-hidden><Icon n="school" /></i><div><b>{p.area === "clinica" ? "Clínica" : "Educativa"}</b><span>área</span></div></div>
          </div>
          {p.includes?.length > 0 && (<><h3>Qué incluye</h3><ul>{p.includes.map((x, i) => <li key={i}>{x}</li>)}</ul></>)}
          {p.how_to_use?.length > 0 && (<><h3>Cómo usarlo</h3><ol>{p.how_to_use.map((x, i) => <li key={i}>{x}</li>)}</ol></>)}
          <p style={{ fontSize: 14, margin: 0 }}>Uso personal o profesional propio, sin reventa.</p>
        </div>
      </div>

      <section id="opiniones" className="sec">
        <h2>Opiniones</h2>
        <div className="rate">
          <div>
            <div className="big">{p.rating_count ? Number(p.rating_avg).toFixed(1) : "Nuevo"}</div>
            <div className="stars">{stars(p.rating_avg ?? 0)}</div>
            <div>{p.rating_count} reseñas</div>
          </div>
          <div>
            {dist.map((d) => (
              <div key={d.n} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
                <span style={{ width: 28 }}>{d.n} ★</span>
                <div className="bar" style={{ flex: 1 }}><i style={{ width: reviews.length ? `${(d.c / reviews.length) * 100}%` : "0%" }} /></div>
                <span style={{ width: 24 }}>{d.c}</span>
              </div>
            ))}
          </div>
        </div>
        {reviews.map((r) => (
          <article key={r.id} className="rev">
            <b>{r.author_name}</b> <span className="stars" aria-label={`${r.rating} de 5`}>{stars(r.rating)}</span>
            <p style={{ margin: "6px 0" }}>{r.comment}</p>
            {r.admin_reply && <div className="reply"><b>Tatiana:</b> {r.admin_reply}</div>}
          </article>
        ))}
        {reviews.length === 0 && <p>Sé la primera persona en opinar.</p>}
        <div style={{ marginTop: 28 }}>
          {!user ? <p><Link href={`/ingresar?next=/tienda/productos/${p.slug}`} style={{ fontWeight: 800 }}>Ingresa</Link> para dejar tu opinión.</p>
            : !owned ? <p>Podrás opinar después de obtener este material.</p>
            : reviewed ? <p>Ya enviaste tu opinión. ¡Gracias!</p>
            : <ReviewForm productId={p.id} slug={p.slug} />}
        </div>
      </section>
      {related.length > 0 && (
        <section className="sec sec-rel">
          <h2 className="big" style={{ fontSize: 34, marginBottom: 16 }}>Más materiales</h2>
          <div className="grid3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
            {related.map((r) => <ProductCard key={r.id} p={r} payments={payments} />)}
          </div>
        </section>
      )}
    </div>
  );
}
