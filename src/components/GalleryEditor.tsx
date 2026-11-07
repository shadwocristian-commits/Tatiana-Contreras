"use client";
import { useRef, useState } from "react";
import { compressImage, MAX_IMGS } from "@/lib/img";
import { Icon } from "@/components/Icons";

export type GItem = { id: string; url?: string; blob?: Blob; ext?: string; preview: string; size?: number; w?: number; h?: number };

export default function GalleryEditor({ items, setItems, title }: { items: GItem[]; setItems: (f: (p: GItem[]) => GItem[]) => void; title: string }) {
  const refC = useRef<HTMLInputElement>(null);
  const refX = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [work, setWork] = useState(false);
  const cover = items[0];
  const extras = items.slice(1);

  async function proc(files: File[], errs: string[]) {
    const done = await Promise.all(files.map(async (f) => {
      try { const r = await compressImage(f); return { id: crypto.randomUUID(), blob: r.blob, ext: r.ext, w: r.w, h: r.h, preview: URL.createObjectURL(r.blob), size: r.blob.size } as GItem; }
      catch (e) { errs.push((e as Error).message); return null; }
    }));
    return done.filter(Boolean) as GItem[];
  }
  async function setCover(files: FileList | null) {
    if (!files?.length) return;
    setMsg(""); setWork(true); const errs: string[] = [];
    const [n] = await proc([files[0]], errs);
    if (n) setItems((p) => [n, ...p.slice(1)]);
    setMsg(errs.join(" ")); setWork(false); if (refC.current) refC.current.value = "";
  }
  async function addExtras(files: FileList | null) {
    if (!files?.length || !cover) return;
    setMsg(""); setWork(true); const errs: string[] = [];
    const room = MAX_IMGS - items.length;
    if (files.length > room) errs.push(`Máximo ${MAX_IMGS} imágenes en total; se ignoraron ${files.length - room}.`);
    const done = await proc(Array.from(files).slice(0, Math.max(0, room)), errs);
    setItems((p) => [...p, ...done].slice(0, MAX_IMGS));
    setMsg(errs.join(" ")); setWork(false); if (refX.current) refX.current.value = "";
  }
  const move = (i: number, d: number) => setItems((p) => { const a = [...p], j = i + d; if (j < 1 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const mkCover = (i: number) => setItems((p) => [p[i], ...p.filter((_, k) => k !== i)]);
  const del = (i: number) => setItems((p) => p.filter((_, k) => k !== i));

  return (
    <div className="ge">
      <div className="ge-h"><b>Portada</b><small>Obligatoria · se ve en la tienda recortada a este marco · ideal 1200×1500 px (vertical)</small></div>
      <div className="ge-grid ge-one">
        {cover ? (
          <div className="ge-it is-cover">
            <img src={cover.preview} alt={`Portada de ${title || "material"}`} />
            <span className="ge-badge">Portada</span>
            <button type="button" className="ge-x" aria-label="Quitar portada" onClick={() => del(0)}><Icon n="close" /></button>
            <div className="ge-bar"><button type="button" onClick={() => refC.current?.click()}>Cambiar portada</button></div>
          </div>
        ) : (
          <button type="button" className="ge-add" onClick={() => refC.current?.click()} disabled={work}>
            <Icon n="image" /><span>{work ? "Procesando…" : "Sube tu portada"}</span><small>JPG, PNG o WebP · se optimiza sola</small>
          </button>
        )}
      </div>
      <div className="ge-h" style={{ marginTop: 18 }}><b>Más imágenes</b><small>{extras.length}/{MAX_IMGS - 1} · vistas del contenido por dentro (opcional)</small></div>
      <div className="ge-grid">
        {extras.map((it, k) => { const i = k + 1; return (
          <div key={it.id} className="ge-it">
            <img src={it.preview} alt={`${title || "Material"} — imagen ${i + 1}`} loading="lazy" />
            <button type="button" className="ge-x" aria-label="Quitar imagen" onClick={() => del(i)}><Icon n="close" /></button>
            <div className="ge-bar">
              <button type="button" aria-label="Mover a la izquierda" disabled={i === 1} onClick={() => move(i, -1)}><Icon n="chevron_left" /></button>
              <button type="button" className="ge-mk" onClick={() => mkCover(i)}>Hacer portada</button>
              <button type="button" aria-label="Mover a la derecha" disabled={i === items.length - 1} onClick={() => move(i, 1)}><Icon n="chevron_right" /></button>
            </div>
          </div>
        ); })}
        {items.length < MAX_IMGS && (
          <button type="button" className="ge-add" onClick={() => refX.current?.click()} disabled={work || !cover}>
            <Icon n="add_photo_alternate" /><span>{!cover ? "Primero la portada" : work ? "Procesando…" : "Agregar imágenes"}</span><small>Hasta {MAX_IMGS - items.length} más</small>
          </button>
        )}
      </div>
      <input ref={refC} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => setCover(e.target.files)} />
      <input ref={refX} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addExtras(e.target.files)} />
      {msg && <div className="msg msg-err" role="alert">{msg}</div>}
    </div>
  );
}
