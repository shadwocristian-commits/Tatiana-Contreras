"use client";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/Icons";
import { pathFromUrl } from "@/lib/img";

export type Fila = { id: string; title: string; status: "publicado" | "borrador" | "agotado" | "archivado"; is_free: boolean; price_cents: number; area: string; cover_url: string | null; gallery: string[] | null; file_path: string | null; created_by?: string | null; autor?: string; categories: { name: string } | null };

const TABS = [["todos", "Todos"], ["publicado", "Publicados"], ["borrador", "Borradores"], ["agotado", "Agotados"], ["archivado", "Archivados"]] as const;
const LABEL: Record<string, string> = { publicado: "Publicado", borrador: "Borrador", agotado: "Agotado", archivado: "Archivado" };

export default function MaterialesLista({ rows }: { rows: Fila[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("todos");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [del, setDel] = useState<Fila | null>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setSel((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const count = (k: string) => (k === "todos" ? rows.filter((r) => r.status !== "archivado").length : rows.filter((r) => r.status === k).length);
  const shown = useMemo(() => rows.filter((r) => (tab === "todos" ? r.status !== "archivado" : r.status === tab) && r.title.toLowerCase().includes(q.trim().toLowerCase())), [rows, tab, q]);

  async function setStatus(r: Fila, status: Fila["status"]) {
    setMenu(null); setMsg(""); setBusy(true);
    const { error } = await createClient().from("products").update({ status }).eq("id", r.id);
    setBusy(false);
    if (error) return setMsg("No se pudo cambiar el estado: " + error.message);
    router.refresh();
  }
  async function bulk(status: Fila["status"]) {
    if (!sel.size) return;
    setMsg(""); setBusy(true);
    const { error } = await createClient().from("products").update({ status }).in("id", [...sel]);
    setBusy(false);
    if (error) return setMsg("No se pudo cambiar el estado: " + error.message);
    setSel(new Set()); router.refresh();
  }
  async function duplicar(r: Fila) {
    setMenu(null); setMsg(""); setBusy(true);
    const sb = createClient();
    const { data: o, error: e1 } = await sb.from("products").select("*").eq("id", r.id).maybeSingle();
    if (e1 || !o) { setBusy(false); return setMsg("No se pudo leer el material para duplicarlo."); }
    const { id: _i, created_at: _c, updated_at: _u, rating_avg: _ra, rating_count: _rc, cover_url: _cv, gallery: _g, gallery_alt: _ga, file_path: _fp, created_by: _cb, ...rest } = o as Record<string, unknown>;
    void [_i, _c, _u, _ra, _rc, _cv, _g, _ga, _fp, _cb];
    const { data: n, error } = await sb.from("products").insert({ ...rest, slug: `${String(o.slug).slice(0, 55)}-copia-${Date.now().toString(36)}`, title: `${String(o.title).slice(0, 100)} (copia)`, status: "borrador", is_published: false, is_sample: false, gallery: [], gallery_alt: [] }).select("id").single();
    setBusy(false);
    if (error || !n) return setMsg("No se pudo duplicar: " + (error?.message ?? ""));
    router.push(`/admin/materiales/${n.id}`);
  }
  async function remove() {
    if (!del || typed.trim().toUpperCase() !== "ELIMINAR") return;
    setBusy(true); setMsg("");
    const sb = createClient();
    const { data, error } = await sb.from("products").delete().eq("id", del.id).eq("status", "archivado").select("id");
    if (error || !data?.length) {
      setBusy(false); setDel(null); setTyped("");
      return setMsg(error?.code === "23503" ? "Este material ya tiene compras u opiniones registradas, por eso no se puede eliminar. Déjalo archivado." : "No se pudo eliminar. Inténtalo de nuevo.");
    }
    const imgs = [...(del.gallery ?? []), ...(del.cover_url ? [del.cover_url] : [])].map(pathFromUrl).filter(Boolean) as string[];
    if (imgs.length) await sb.storage.from("portadas").remove([...new Set(imgs)]);
    if (del.file_path) await sb.storage.from("materiales").remove([del.file_path]);
    setBusy(false); setDel(null); setTyped("");
    router.refresh();
  }

  const menuRow = rows.find((r) => r.id === menu) ?? null;
  const Item = ({ icon, label, hint, onClick, danger }: { icon: string; label: string; hint?: string; onClick: () => void; danger?: boolean }) => (
    <button type="button" className={"ml-i" + (danger ? " dg" : "")} onClick={onClick}><Icon n={icon} /><span>{label}{hint && <small>{hint}</small>}</span></button>
  );

  return (
    <div className="adm-c" onClick={() => setMenu(null)}>
      <div className="ml-tabs">
        {TABS.map(([k, l]) => <button key={k} type="button" className={"ml-tab" + (tab === k ? " on" : "")} onClick={(e) => { e.stopPropagation(); setTab(k); }}>{l}<i>{count(k)}</i></button>)}
      </div>
      <label className="ml-s"><Icon n="search" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título…" aria-label="Buscar material" /></label>
      {sel.size > 0 && (
        <div className="ml-bulk" role="toolbar" aria-label="Acciones para los seleccionados">
          <b>{sel.size} seleccionado{sel.size > 1 ? "s" : ""}</b>
          <button type="button" disabled={busy} onClick={() => bulk("agotado")}>Marcar agotado</button>
          <button type="button" disabled={busy} onClick={() => bulk("borrador")}>Pasar a borrador</button>
          <button type="button" disabled={busy} onClick={() => bulk("archivado")}>Archivar</button>
          <button type="button" onClick={() => setSel(new Set())}>Cancelar</button>
        </div>
      )}
      {msg && <div className="msg msg-err" role="alert">{msg}</div>}
      {shown.length === 0 ? <p style={{ margin: 0 }}>{rows.length === 0 ? "Aún no hay materiales. Crea el primero." : "No hay materiales en esta vista."}</p> : (
        <div style={{ overflowX: "auto" }}>
          <table className="adm-t">
            <thead><tr><th style={{ width: 28 }}><input type="checkbox" aria-label="Seleccionar todos" checked={shown.length > 0 && shown.every((r) => sel.has(r.id))} onChange={(e) => setSel(e.target.checked ? new Set(shown.map((r) => r.id)) : new Set())} /></th><th>Título</th><th className="hm">Terapia</th><th className="hm">Autor</th><th className="hm">Precio</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}>
                  <td><input type="checkbox" aria-label={`Seleccionar ${p.title}`} checked={sel.has(p.id)} onChange={() => toggle(p.id)} /></td>
                  <td><b>{p.title}</b><small className="ml-meta">{[p.categories?.name, p.autor, p.is_free || p.price_cents === 0 ? "Gratis" : `S/ ${(p.price_cents / 100).toFixed(2)}`].filter(Boolean).join(" · ")}</small></td>
                  <td className="hm">{p.categories?.name ?? "—"}</td>
                  <td className="hm">{p.autor ?? "—"}</td>
                  <td className="hm">{p.is_free || p.price_cents === 0 ? "Gratis" : `S/ ${(p.price_cents / 100).toFixed(2)}`}</td>
                  <td><span className={`adm-st st-${p.status}`}>{LABEL[p.status]}</span></td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right", position: "relative" }}>
                    <Link href={`/admin/materiales/${p.id}`} style={{ color: "var(--cacao)", fontWeight: 800, textDecoration: "underline", marginRight: 10 }}>Editar</Link>
                    <button type="button" className="ml-more" aria-label={`Más acciones para ${p.title}`} aria-expanded={menu === p.id} disabled={busy} onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setPos({ top: r.bottom + 4 + 230 > window.innerHeight ? Math.max(8, r.top - 4 - 230) : r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) }); setMenu(menu === p.id ? null : p.id); }}><Icon n="more_horiz" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {menuRow && typeof document !== "undefined" && createPortal(
      <><div className="ml-back0" onClick={() => setMenu(null)} /><div className="ml-menu" role="menu" style={{ top: pos.top, right: pos.right }} onClick={(e) => e.stopPropagation()}>
        {menuRow.status === "borrador" && <Item icon="visibility" label="Publicar" onClick={() => setStatus(menuRow, "publicado")} />}
        {menuRow.status === "archivado" && <Item icon="unarchive" label="Restaurar como borrador" onClick={() => setStatus(menuRow, "borrador")} />}
        {menuRow.status === "publicado" && <Item icon="production_quantity_limits" label="Marcar como agotado" hint="Se ve en la tienda, sin poder obtenerse" onClick={() => setStatus(menuRow, "agotado")} />}
        {menuRow.status === "agotado" && <Item icon="inventory" label="Volver a publicar" hint="Hay stock otra vez" onClick={() => setStatus(menuRow, "publicado")} />}
        {(menuRow.status === "publicado" || menuRow.status === "agotado") && <Item icon="visibility_off" label="Pasar a borrador" onClick={() => setStatus(menuRow, "borrador")} />}
        <Item icon="content_copy" label="Duplicar" hint="Copia los textos como borrador" onClick={() => duplicar(menuRow)} />
        {menuRow.status !== "archivado" && <Item icon="inventory_2" label="Archivar" hint="Lo oculta; se puede restaurar" onClick={() => setStatus(menuRow, "archivado")} />}
        {menuRow.status === "archivado" && <Item icon="delete" label="Eliminar…" danger onClick={() => { setMenu(null); setDel(menuRow); setTyped(""); }} />}
      </div>
     </>, document.body)}
      {del && (
        <div className="ml-back" role="dialog" aria-modal="true" aria-label="Eliminar material" onClick={() => !busy && setDel(null)}>
          <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar este material?</h3>
            <p>Se borrará <b>«{del.title}»</b> para siempre, junto con sus imágenes y su archivo. <b>No se puede deshacer.</b> Si solo quieres dejar de venderlo, déjalo archivado.</p>
            <label className="af">Escribe <b>ELIMINAR</b> para confirmar<input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus /></label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn" onClick={() => setDel(null)} disabled={busy}>Mejor no</button>
              <button type="button" className="btn ml-danger" onClick={remove} disabled={busy || typed.trim().toUpperCase() !== "ELIMINAR"}>{busy ? "Eliminando…" : "Eliminar para siempre"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
