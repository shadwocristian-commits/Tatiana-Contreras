import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { getCategorias, getPagosActivos } from "@/lib/publico";
import AccessCard from "@/components/AccessCard";
import ProductCard from "@/components/ProductCard";
import { Icon, TherapyIcon } from "@/components/Icons";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const TONES = ["t-sage", "t-honey", "t-sky", "t-coral", "t-sage", "t-honey"];

export default async function Home() {
  const sb = await createClient();
  const [user, payments, { data }, cats, { data: all }] = await Promise.all([
    getUser(),
    getPagosActivos(),
    sb.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(3),
    getCategorias(),
    sb.from("products").select("category_id").eq("is_published", true),
  ]);
  const products = (data ?? []) as Product[];
  const categories = cats as (Category & { id: string })[];
  const counts = new Map<string, number>();
  (all ?? []).forEach((r: { category_id: string | null }) => r.category_id && counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1));
  const total = all?.length ?? 0;

  return (
    <>
      <div className="wrap">
        <section className="hero">
          <div className="hero-l">
            <span className="pill pill-honey" style={{ alignSelf: "flex-start" }}><Icon n="favorite" />Materiales para terapia</span>
            <h1>Recursos listos para cada sesión</h1>
            <p className="lead">Fichas, tarjetas y guías para estimular, enseñar y acompañar. Descarga, imprime y úsalas hoy.</p>
            <form className="searchbar" action="/tienda" role="search">
              <label htmlFor="q" style={{ position: "absolute", left: -9999 }}>Buscar materiales</label>
              <input id="q" name="q" placeholder="Busca: lenguaje, atención, conducta…" />
              <button className="btn btn-pri" style={{ minHeight: 44 }}>Buscar</button>
            </form>
          </div>
          {user ? (
            <section className="access" aria-label="Tu cuenta">
              <h2 style={{ fontSize: 30 }}>Qué bueno verte de nuevo</h2>
              <p style={{ margin: 0 }}>Tus materiales están listos para descargar cuando los necesites.</p>
              <Link className="btn btn-pri" href="/cuenta/mis-compras" style={{ color: "#fff" }}>Ir a mis materiales</Link>
              <Link className="btn" href="/tienda">Seguir explorando</Link>
            </section>
          ) : (
            <AccessCard initial="registro" />
          )}
        </section>

        <section className="sec" id="terapias">
          <div className="sec-h"><h2 className="sec-t">Elige tu tipo de terapia</h2><Link href="/tienda" style={{ fontWeight: 800 }}>Ver todo →</Link></div>
          <div className="tiles">
            {categories.map((c, i) => {
              const n = counts.get(c.id) ?? 0;
              return (
                <Link key={c.slug} href={`/tienda?cat=${c.slug}`} className={`tile ${TONES[i % TONES.length]}`}>
                  <span className="ic"><TherapyIcon slug={c.slug} /></span>
                  <h3 style={{ marginTop: 74 }}>{c.name}</h3>
                  <span>{n === 0 ? "Pronto" : `${n} ${n === 1 ? "material" : "materiales"}`}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section id="guia" className="guide" aria-label="Cómo usar la tienda">
        <div className="wrap guide-in">
          <div className="guide-doll">
            <div className="halo"><img src="/images/guia.png" alt="Guía virtual de la tienda" /></div>
            <div className="bubble">¡Hola! Soy tu guía.<br />¡Sígueme!</div>
          </div>
          <div style={{ flex: "1 1 560px" }}>
            <h2 className="sec-t" style={{ marginBottom: 16 }}>Cómo usar la tienda</h2>
            <div className="steps" style={{ flex: "none" }}>
              <div className="step"><b className="n"><Icon n="search" /></b><h3>Elige tu terapia</h3><span>Busca por tipo de terapia o por área.</span></div>
              <div className="step"><b className="n"><Icon n="person_add" /></b><h3>Crea tu cuenta</h3><span>Es gratis y toma un minuto.</span></div>
              <div className="step"><b className="n"><Icon n="download" /></b><h3>Obtén y descarga</h3><span>Tu material al instante, en PDF.</span></div>
              <div className="step"><b className="n"><Icon n="star" /></b><h3>Opina</h3><span>Cuéntanos cómo te funcionó.</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="stats" aria-label="La tienda en cifras">
          <div><Icon n="inventory_2" /><b>{total}</b><span>{total === 1 ? "material listo" : "materiales listos"}</span></div>
          <div><Icon n="picture_as_pdf" /><b>PDF</b><span>imprimibles en A4</span></div>
          <div><Icon n="extension" /><b>{categories.length}</b><span>tipos de terapia</span></div>
          <div><Icon n="redeem" /><b>Gratis</b><span>por ahora</span></div>
        </section>

        <section className="sec">
          <div className="sec-h"><h2 className="sec-t">Lo más nuevo</h2><Link href="/tienda" style={{ fontWeight: 800 }}>Ver todo</Link></div>
          {products.length === 0 ? <p>Pronto habrá nuevos materiales.</p> : (
            <div className="grid3">{products.map((p) => <ProductCard key={p.id} p={p} payments={payments} />)}</div>
          )}
        </section>

        <section className="sec trust">
          <div className="box"><span className="bx"><Icon n="bolt" /></span><h3 style={{ fontSize: 22 }}>Descarga inmediata</h3><p style={{ marginBottom: 0 }}>Obtienes el archivo al instante, sin esperas.</p></div>
          <div className="box"><span className="bx"><Icon n="verified_user" /></span><h3 style={{ fontSize: 22 }}>Hechos por una psicóloga</h3><p style={{ marginBottom: 0 }}>Cada material pasa por una revisión profesional.</p></div>
          <div className="box"><span className="bx"><Icon n="cloud_download" /></span><h3 style={{ fontSize: 22 }}>Tu cuenta, tus descargas</h3><p style={{ marginBottom: 0 }}>Vuelve a descargar tus materiales cuando quieras.</p></div>
        </section>
      </div>
    </>
  );
}
