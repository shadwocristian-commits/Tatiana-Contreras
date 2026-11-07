import Link from "next/link";
import { AREA_LABEL, type Product } from "@/lib/types";
import { priceLabel } from "@/lib/pagos";

export function Stars({ value }: { value: number }) {
  const n = Math.round(value);
  return <span className="stars" aria-hidden="true">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export function RatingLine({ p }: { p: Pick<Product, "rating_avg" | "rating_count"> }) {
  if (p.rating_count === 0) return <span style={{ fontSize: 14, color: "var(--muted)" }}>Aún sin reseñas</span>;
  return (
    <span style={{ fontSize: 14 }}>
      <Stars value={p.rating_avg} /> <b>{Number(p.rating_avg).toFixed(1)}</b> · {p.rating_count} {p.rating_count === 1 ? "reseña" : "reseñas"}
    </span>
  );
}

export function tone(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 3;
  return `w${h}`;
}

export default function ProductCard({ p, payments }: { p: Product; payments: boolean }) {
  return (
    <article className={"card" + (p.status === "agotado" ? " is-out" : "")}>
      <div className={`thumb ${tone(p.slug)}${p.cover_url ? " has-img" : ""}`}>
        {p.cover_url && <><img className="fg" src={p.cover_url} alt={`Portada de ${p.title}`} loading="lazy" decoding="async" /></>}
        <span className="tag">{p.status === "agotado" ? "Agotado" : AREA_LABEL[p.area]}</span>
        <span className="tag" style={{ background: "var(--ink)", color: "#fff" }}>{p.format}</span>
      </div>
      <div className="card-b">
        <h3>{p.title}</h3>
        <RatingLine p={p} />
        <div className="row">
          <b style={{ fontSize: 18 }}>{priceLabel(p, payments)}</b>
          <Link className="btn btn-pri" href={`/tienda/productos/${p.slug}`} style={{ minHeight: 44, color: "#fff" }}>Ver material</Link>
        </div>
      </div>
    </article>
  );
}
