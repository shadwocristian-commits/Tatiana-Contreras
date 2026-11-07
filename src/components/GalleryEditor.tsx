"use client";
import { useRef, useState } from "react";
import { compressImage, MAX_IMGS } from "@/lib/img";
import { Icon } from "@/components/Icons";

export type GItem = { id: string; url?: string; blob?: Blob; ext?: string; preview: string; size?: number };

export default function GalleryEditor({ items, setItems, title }: { items: GItem[]; setItems: (f: (p: GItem[]) => GItem[]) => void; title: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [work, setWork] = useState(false);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setMsg(""); setWork(true);
    const room = MAX_IMGS - items.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    const errs: string[] = [];
    if (files.length > room) errs.push(`Máximo ${MAX_IMGS} imágenes; se ignoraron ${files.length - room}.`);
    const done = await Promise.all(list.map(async (f) => {
      try { const r = await compressImage(f); return { id: crypto.randomUUID(), blob: r.blob, ext: r.ext, preview: URL.createObjectURL(r.blob), size: r.blob.size } as GItem; }
      catch (e) { errs.push((e as Error).message); return null; }
    }));
    setItems((p) => [...p, ...(done.filter(Boolean) as GItem[])].slice(0, MAX_IMGS));
    setMsg(errs.join(" ")); setWork(false);
    if (ref.current) ref.current.value = "";
  }
  const move = (i: number, d: number) => setItems((p) => { const a = [...p], j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const cover = (i: number) => setItems((p) => [p[i], ...p.filter((_, k) => k !== i)]);
  const del = (i: number) => setItems((p) => p.filter((_, k) => k !== i));

  return (
    <div className="ge">
      <div className="ge-h"><b>Imágenes del material</b><small>{items.length}/{MAX_IMGS} · la primera es la portada</small></div>
      <div className="ge-grid">
        {items.map((it, i) => (
          <div key={it.id} className={"ge-it" + (i === 0 ? " is-cover" : "")}>
            <img src={it.preview} alt={`${title || "Material"} — imagen ${i + 1}`} loading="lazy" />
            {i === 0 && <span className="ge-badge">Portada</span>}
            <button type="button" className="ge-x" aria-label="Quitar imagen" onClick={() => del(i)}><Icon n="close" /></button>
            <div className="ge-bar">
              <button type="button" aria-label="Mover a la izquierda" disabled={i === 0} onClick={() => move(i, -1)}><Icon n="chevron_left" /></button>
              {i > 0 && <button type="button" className="ge-mk" onClick={() => cover(i)}>Hacer portada</button>}
              <button type="button" aria-label="Mover a la derecha" disabled={i === items.length - 1} onClick={() => move(i, 1)}><Icon n="chevron_right" /></button>
            </div>
          </div>
        ))}
        {items.length < MAX_IMGS && (
          <button type="button" className="ge-add" onClick={() => ref.current?.click()} disabled={work}>
            <Icon n="add_photo_alternate" /><span>{work ? "Procesando…" : "Agregar imágenes"}</span><small>JPG, PNG o WebP · se optimizan solas</small>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => add(e.target.files)} />
      {msg && <div className="msg msg-err" role="alert">{msg}</div>}
    </div>
  );
}
