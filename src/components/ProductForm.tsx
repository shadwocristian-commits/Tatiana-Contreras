"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/types";
import GalleryEditor, { type GItem } from "@/components/GalleryEditor";
import { pathFromUrl } from "@/lib/img";

type P = Product & { category_id: string | null; is_published: boolean };

const slugify = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
const safeName = (n: string) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
const lines = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);

export default function ProductForm({ categories, product }: { categories: (Category & { id: string })[]; product?: P }) {
  const router = useRouter();
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [touched, setTouched] = useState(!!product);
  const [free, setFree] = useState(product ? product.is_free || product.price_cents === 0 : true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const initial = (product?.gallery?.length ? product.gallery : product?.cover_url ? [product.cover_url] : []);
  const [imgs, setImgs] = useState<GItem[]>(initial.map((u) => ({ id: u, url: u, preview: u })));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const sb = createClient();
    const file = f.get("file") as File | null;
    const finalSlug = slugify(slug || title);
    if (!finalSlug) return setError("Escribe un título.");
    if (file && file.size > 0) {
      if (!/\.(pdf|zip)$/i.test(file.name)) return setError("El material debe ser un archivo PDF o ZIP.");
      if (file.size > 50 * 1024 * 1024) return setError("El archivo pesa más de 50 MB.");
    }
    if (!imgs.length) return setError("Sube la portada del material.");
    if (f.get("is_published") === "on" && !file?.size && !product?.file_path) return setError("Para publicar necesitas subir el archivo del material.");
    setBusy(true);
    let file_path = product?.file_path ?? null;

    // Subir imágenes nuevas en paralelo; si alguna falla, se cancela todo sin guardar a medias.
    const fresh = imgs.filter((x) => x.blob);
    const up = await Promise.allSettled(fresh.map(async (x, n) => {
      const path = `${finalSlug}-${Date.now()}-${n}-${x.id.slice(0, 6)}.${x.ext}`;
      const { error: err } = await sb.storage.from("portadas").upload(path, x.blob!, { contentType: x.ext === "webp" ? "image/webp" : "image/jpeg", cacheControl: "31536000", upsert: false });
      if (err) throw err;
      return { id: x.id, path, url: sb.storage.from("portadas").getPublicUrl(path).data.publicUrl };
    }));
    const okUp = up.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    if (okUp.length !== fresh.length) {
      if (okUp.length) await sb.storage.from("portadas").remove(okUp.map((o) => o.path));
      setBusy(false); return setError("No se pudieron subir todas las imágenes. Revisa tu conexión e inténtalo de nuevo.");
    }
    const urlOf = new Map(okUp.map((o) => [o.id, o.url]));
    const gallery = imgs.map((x) => x.url ?? urlOf.get(x.id)!).filter(Boolean);
    const cover_url = gallery[0] ?? null;
    if (file && file.size > 0) {
      if (!/\.(pdf|zip)$/i.test(file.name)) { setBusy(false); return setError("El material debe ser un archivo PDF o ZIP."); }
      if (file.size > 50 * 1024 * 1024) { setBusy(false); return setError("El archivo pesa más de 50 MB."); }
      const path = `${finalSlug}/${safeName(file.name)}`;
      const { error: err } = await sb.storage.from("materiales").upload(path, file, { contentType: file.type || "application/pdf", upsert: true });
      if (err) { setBusy(false); return setError("No se pudo subir el archivo: " + err.message); }
      file_path = path;
    }

    const publish = f.get("is_published") === "on";
    if (publish && !file_path) { setBusy(false); return setError("Para publicar necesitas subir el archivo del material."); }
    const price = free ? 0 : Math.round(Number(f.get("price") || 0) * 100);
    const row = {
      slug: finalSlug,
      title: title.trim(),
      description: String(f.get("description") ?? "").trim(),
      includes: lines(String(f.get("includes") ?? "")),
      how_to_use: lines(String(f.get("how_to_use") ?? "")),
      area: String(f.get("area")),
      category_id: String(f.get("category_id")) || null,
      age_range: String(f.get("age_range") ?? "").trim() || null,
      format: String(f.get("format") ?? "PDF").trim() || "PDF",
      is_free: free,
      price_cents: price,
      is_published: publish,
      cover_url,
      gallery,
      file_path,
    };
    const { error: err } = product
      ? await sb.from("products").update(row).eq("id", product.id)
      : await sb.from("products").insert(row);
    if (err) {
      if (okUp.length) await sb.storage.from("portadas").remove(okUp.map((o) => o.path));
      setBusy(false);
      return setError(err.code === "23505" ? "Ya existe un material con ese enlace (slug). Cámbialo." : "No se pudo guardar: " + err.message);
    }
    // Limpieza: borrar de Storage las imágenes que se quitaron.
    const keep = new Set(gallery);
    const old = [...(product?.gallery ?? []), ...(product?.cover_url ? [product.cover_url] : [])].filter((u) => !keep.has(u));
    const rm = [...new Set(old.map(pathFromUrl).filter(Boolean) as string[])];
    if (rm.length) await sb.storage.from("portadas").remove(rm);
    setBusy(false);
    router.push("/admin/materiales");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="adm-c adm-form">
      <label className="af">Título<input value={title} required maxLength={120} onChange={(e) => { setTitle(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} placeholder="Ej.: Tarjetas de emociones para niños" /></label>
      <label className="af">Enlace (se genera solo)<input value={slug} onChange={(e) => { setTouched(true); setSlug(e.target.value); }} placeholder="tarjetas-de-emociones" /></label>
      <label className="af">Descripción<textarea name="description" rows={4} defaultValue={product?.description} placeholder="Para qué sirve, a quién va dirigido y cómo usarlo en sesión." /></label>
      <div className="af-row">
        <label className="af">Tipo de terapia
          <select name="category_id" defaultValue={product?.category_id ?? ""} required>
            <option value="" disabled>Elige…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="af">Área
          <select name="area" defaultValue={product?.area ?? "clinica"}><option value="clinica">Clínica</option><option value="educativa">Educativa</option></select>
        </label>
      </div>
      <div className="af-row">
        <label className="af">Edades<input name="age_range" defaultValue={product?.age_range ?? ""} placeholder="Ej.: 4 a 8 años" /></label>
        <label className="af">Formato<input name="format" defaultValue={product?.format ?? "PDF"} /></label>
      </div>
      <label className="af">Qué incluye (uno por línea)<textarea name="includes" rows={3} defaultValue={product?.includes?.join("\n")} /></label>
      <label className="af">Cómo usarlo (un paso por línea)<textarea name="how_to_use" rows={3} defaultValue={product?.how_to_use?.join("\n")} /></label>
      <div className="af-row">
        <label className="af-chk"><input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> Material gratis</label>
        {!free && <label className="af">Precio en soles (S/)<input name="price" type="number" min="0" step="0.5" defaultValue={product ? product.price_cents / 100 : ""} /></label>}
      </div>
      <div className="af-row">
        <label className="af">Archivo del material (PDF, máx. 50 MB){product?.file_path && <small>Archivo actual: {product.file_path}</small>}<input name="file" type="file" accept=".pdf,.zip,application/pdf,application/zip" /></label>
      </div>
      <GalleryEditor items={imgs} setItems={setImgs} title={title} />
      <label className="af-chk"><input type="checkbox" name="is_published" defaultChecked={product?.is_published} /> Publicado (visible en la tienda)</label>
      {error && <div className="msg msg-err" role="alert">{error}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-honey" disabled={busy}>{busy ? "Guardando…" : "Guardar material"}</button>
        <button type="button" className="btn" onClick={() => router.push("/admin/materiales")}>Cancelar</button>
      </div>
    </form>
  );
}
