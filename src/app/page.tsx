import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { paymentsEnabled } from "@/lib/pagos";
import AccessCard from "@/components/AccessCard";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const payments = await paymentsEnabled(sb);
  const { data } = await sb.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(3);
  const products = (data ?? []) as Product[];

  return (
    <div className="wrap">
      <section className="hero">
        <div className="hero-l">
          <span className="pill pill-honey" style={{ alignSelf: "flex-start" }}>Psicología clínica y educativa</span>
          <h1>Materiales para acompañar cada sesión y cada aula</h1>
          <p className="lead">Fichas, tarjetas y guías creadas por una psicóloga. Descarga, imprime y úsalas hoy.</p>
          <form className="searchbar" action="/tienda" role="search">
            <label htmlFor="q" style={{ position: "absolute", left: -9999 }}>Buscar materiales</label>
            <input id="q" name="q" placeholder="Busca: lenguaje, atención, conducta…" />
            <button className="btn btn-pri" style={{ minHeight: 44 }}>Buscar</button>
          </form>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/tienda?area=clinica" style={{ minHeight: 44 }}>Ver Clínica</Link>
            <Link className="btn" href="/tienda?area=educativa" style={{ minHeight: 44 }}>Ver Educativa</Link>
          </div>
        </div>
        {user ? (
          <section className="access" aria-label="Tu cuenta">
            <h2 style={{ fontSize: 30 }}>Qué bueno verte de nuevo</h2>
            <p style={{ margin: 0 }}>Tus materiales están listos para descargar cuando los necesites.</p>
            <Link className="btn btn-pri" href="/cuenta/mis-compras" style={{ color: "#fff" }}>Ir a mis materiales</Link>
            <Link className="btn" href="/tienda">Seguir explorando</Link>
          </section>
        ) : (
          <AccessCard />
        )}
      </section>

      <section className="areas">
        <Link href="/tienda?area=clinica" className="area-tile" style={{ background: "radial-gradient(circle at 85% 20%,#A9D6A0 0,transparent 50%),radial-gradient(circle at 10% 90%,#CFE0BF 0,transparent 55%),#EEF4E6" }}>
          <h2>Clínica</h2><span>Fichas y guías para la consulta.</span>
        </Link>
        <Link href="/tienda?area=educativa" className="area-tile" style={{ background: "radial-gradient(circle at 85% 20%,#F0D27A 0,transparent 50%),radial-gradient(circle at 10% 90%,#F29C85 0,transparent 55%),#FBEBC0" }}>
          <h2>Educativa</h2><span>Recursos para aula, familia y orientación.</span>
        </Link>
      </section>

      <section className="sec">
        <div className="sec-h"><h2>Lo más nuevo</h2><Link href="/tienda" style={{ fontWeight: 800 }}>Ver todo</Link></div>
        {products.length === 0 ? <p>Pronto habrá nuevos materiales.</p> : (
          <div className="grid3">{products.map((p) => <ProductCard key={p.id} p={p} payments={payments} />)}</div>
        )}
      </section>

      <section className="sec trust" style={{ paddingBottom: 0 }}>
        <div className="box"><h3 style={{ fontSize: 22 }}>Descarga inmediata</h3><p style={{ marginBottom: 0 }}>Obtienes el archivo al instante, sin esperas.</p></div>
        <div className="box"><h3 style={{ fontSize: 22 }}>Revisado por una psicóloga</h3><p style={{ marginBottom: 0 }}>Cada material pasa por la revisión de Tatiana.</p></div>
        <div className="box"><h3 style={{ fontSize: 22 }}>Tu cuenta, tus descargas</h3><p style={{ marginBottom: 0 }}>Vuelve a descargar tus materiales cuando quieras.</p></div>
      </section>

      <section id="guia" className="band" style={{ marginBottom: 0 }}>
        <div className="wrap guide">
          <div className="guide-l">
            <img src="/images/asistente.jpg" alt="Guía virtual de Materiales de Tatiana" />
            <div className="bubble">¡Hola! Soy tu guía. Te llevo paso a paso: elegir, obtener y descargar tu material.</div>
          </div>
          <div>
            <h2 style={{ fontSize: 40, marginBottom: 6 }}>Cómo usar la tienda</h2>
            <p style={{ margin: "0 0 18px" }}>Cuatro pasos y tu material está listo para usar en terapia, aula o casa.</p>
            <ol className="steps">
              <li><b className="n">1</b><h3>Elige tu terapia</h3><span>Lenguaje, atención, aprendizaje, conducta, estimulación temprana o emocional.</span><Link href="/tienda" style={{ fontWeight: 800 }}>Ir a la tienda</Link></li>
              <li><b className="n">2</b><h3>Crea tu cuenta</h3><span>Es gratis y solo toma un minuto.</span><Link href="/registro" style={{ fontWeight: 800 }}>Crear cuenta</Link></li>
              <li><b className="n">3</b><h3>Obtén y descarga</h3><span>Pulsa “Obtener” y descárgalo desde Mis materiales cuando quieras.</span><Link href="/cuenta/mis-compras" style={{ fontWeight: 800 }}>Mis materiales</Link></li>
              <li><b className="n">4</b><h3>Cuéntanos cómo te fue</h3><span>Deja tu calificación y comentario en el material.</span><Link href="/tienda?gratis=1" style={{ fontWeight: 800 }}>Ver gratis</Link></li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
