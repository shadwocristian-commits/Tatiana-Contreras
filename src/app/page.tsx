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
            <input id="q" name="q" placeholder="Busca: ansiedad, emociones, atención…" />
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

      <section className="sec trust">
        <div className="box"><h3 style={{ fontSize: 22 }}>Descarga inmediata</h3><p style={{ marginBottom: 0 }}>Obtienes el archivo al instante, sin esperas.</p></div>
        <div className="box"><h3 style={{ fontSize: 22 }}>Revisado por una psicóloga</h3><p style={{ marginBottom: 0 }}>Cada material pasa por la revisión de Tatiana.</p></div>
        <div className="box"><h3 style={{ fontSize: 22 }}>Tu cuenta, tus descargas</h3><p style={{ marginBottom: 0 }}>Vuelve a descargar tus materiales cuando quieras.</p></div>
      </section>

      <section id="autora" className="author" style={{ marginTop: 16 }}>
        <img src="/images/asistente.jpg" alt="Asistente virtual de Tatiana" />
        <div style={{ flex: "1 1 420px" }}>
          <h2 style={{ fontSize: 32 }}>Hola, soy Tatiana</h2>
          <p style={{ margin: "8px 0 0", fontSize: 17, lineHeight: 1.6 }}>
            [Presentación de Tatiana: formación, años de experiencia y por qué creó estos materiales.] Diseño cada material pensando en cómo se usa de verdad en la sesión y en el aula.
          </p>
        </div>
      </section>
    </div>
  );
}
