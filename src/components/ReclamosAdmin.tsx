"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type Rec = { id: string; numero: string; created_at: string; tipo: string; nombre: string; doc_tipo: string; doc_num: string; email: string; telefono: string | null; bien: string; monto: string | null; detalle: string; pedido: string; estado: string; respuesta: string | null; menor_edad: boolean; tutor: string | null };

export default function ReclamosAdmin({ rows }: { rows: Rec[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [txt, setTxt] = useState<Record<string, string>>({});
  async function atender(r: Rec) {
    const t = (txt[r.id] ?? "").trim();
    if (t.length < 5) return alert("Escribe la respuesta que enviaste a la persona.");
    setBusy(r.id);
    await createClient().from("reclamos").update({ estado: "atendido", respuesta: t, respondido_at: new Date().toISOString() }).eq("id", r.id);
    setBusy(""); router.refresh();
  }
  if (!rows.length) return <div className="adm-c"><p style={{ margin: 0 }}>Aún no hay reclamos ni quejas.</p></div>;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.map((r) => (
        <div key={r.id} className="adm-c" style={{ display: "grid", gap: 8 }}>
          <div><b>{r.numero}</b> · <span className={`adm-st ${r.estado === "atendido" ? "st-publicado" : "st-agotado"}`}>{r.estado === "atendido" ? "Atendido" : "Pendiente"}</span> · {r.tipo === "queja" ? "Queja" : "Reclamo"} · {new Date(r.created_at).toLocaleDateString("es-PE")}</div>
          <div style={{ fontSize: 14 }}>{r.nombre} · {r.doc_tipo} {r.doc_num} · <a href={`mailto:${r.email}`}>{r.email}</a>{r.telefono ? ` · ${r.telefono}` : ""}{r.menor_edad ? ` · Menor (tutor: ${r.tutor})` : ""}</div>
          <div style={{ fontSize: 14 }}><b>Material:</b> {r.bien}{r.monto ? ` · ${r.monto}` : ""}</div>
          <div style={{ whiteSpace: "pre-line" }}><b>Detalle:</b> {r.detalle}</div>
          <div style={{ whiteSpace: "pre-line" }}><b>Solución esperada:</b> {r.pedido}</div>
          {r.estado === "atendido" ? <div className="msg"><b>Respuesta:</b> {r.respuesta}</div> : (
            <>
              <textarea rows={3} placeholder="Respuesta enviada al correo de la persona" value={txt[r.id] ?? ""} onChange={(e) => setTxt({ ...txt, [r.id]: e.target.value })} />
              <button className="btn btn-ok" disabled={busy === r.id} onClick={() => atender(r)}>Marcar como atendido</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
