"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const num = () => `LR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10000 + Math.random() * 90000)}`;

export default function ReclamoForm({ plazo }: { plazo: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [menor, setMenor] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const f = new FormData(e.currentTarget);
    if (f.get("web")) return; // trampa para robots
    const g = (k: string) => String(f.get(k) ?? "").trim();
    const doc = g("doc_num");
    if (g("doc_tipo") === "DNI" && !/^[0-9]{8}$/.test(doc)) return setError("El DNI debe tener 8 números.");
    if (menor && g("tutor").length < 3) return setError("Indica el nombre del padre, madre o tutor.");
    if (f.get("ok") !== "on") return setError("Marca la casilla de conformidad para enviar.");
    setBusy(true);
    const numero = num();
    const { error: err } = await createClient().from("reclamos").insert({
      numero, tipo: g("tipo"), nombre: g("nombre"), doc_tipo: g("doc_tipo"), doc_num: doc, email: g("email"),
      telefono: g("telefono") || null, domicilio: g("domicilio") || null, menor_edad: menor, tutor: menor ? g("tutor") : null,
      bien: g("bien"), monto: g("monto") || null, detalle: g("detalle"), pedido: g("pedido"),
    });
    setBusy(false);
    if (err) return setError("No se pudo enviar. Revisa los datos e inténtalo de nuevo.");
    setOk(numero);
  }

  if (ok) return (
    <div className="card-ok" role="status">
      <h2>Recibimos tu {""}hoja de reclamación</h2>
      <p>Tu número de registro es <b>{ok}</b>. Guárdalo para cualquier consulta.</p>
      <p>Te responderemos al correo que indicaste en un plazo máximo de <b>{plazo} días calendario</b>.</p>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="adm-c adm-form" style={{ maxWidth: 760 }}>
      <input name="web" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999 }} aria-hidden />
      <h3 style={{ margin: 0 }}>1. Tus datos</h3>
      <label className="af">Nombre completo<input name="nombre" required minLength={3} maxLength={120} /></label>
      <div className="af-row">
        <label className="af">Documento<select name="doc_tipo" defaultValue="DNI"><option>DNI</option><option>CE</option><option>Pasaporte</option><option>RUC</option></select></label>
        <label className="af">Número<input name="doc_num" required minLength={6} maxLength={20} inputMode="numeric" /></label>
      </div>
      <div className="af-row">
        <label className="af">Correo electrónico<input name="email" type="email" required maxLength={160} /></label>
        <label className="af">Teléfono (opcional)<input name="telefono" maxLength={20} inputMode="tel" /></label>
      </div>
      <label className="af">Domicilio (opcional)<input name="domicilio" maxLength={200} /></label>
      <label className="af-chk"><input type="checkbox" checked={menor} onChange={(e) => setMenor(e.target.checked)} /> Soy menor de edad</label>
      {menor && <label className="af">Nombre del padre, madre o tutor<input name="tutor" maxLength={120} /></label>}
      <h3 style={{ margin: "8px 0 0" }}>2. Lo que contrataste</h3>
      <label className="af">Material o servicio<input name="bien" required minLength={2} maxLength={200} placeholder="Ej.: Tarjetas de emociones" /></label>
      <label className="af">Monto pagado (opcional)<input name="monto" maxLength={30} placeholder="Ej.: S/ 12.00 o Gratis" /></label>
      <h3 style={{ margin: "8px 0 0" }}>3. Tu reclamo o queja</h3>
      <div className="af-row">
        <label className="af-chk"><input type="radio" name="tipo" value="reclamo" defaultChecked /> <span><b>Reclamo</b>: disconformidad con el material o servicio</span></label>
        <label className="af-chk"><input type="radio" name="tipo" value="queja" /> <span><b>Queja</b>: malestar por la atención, sin relación al material</span></label>
      </div>
      <label className="af">Detalle<textarea name="detalle" rows={5} required minLength={10} maxLength={2000} /></label>
      <label className="af">¿Qué solución esperas?<textarea name="pedido" rows={3} required minLength={5} maxLength={1000} /></label>
      <label className="af-chk"><input type="checkbox" name="ok" /> Declaro que los datos son ciertos y acepto el tratamiento de mis datos para atender esta hoja, según la política de privacidad.</label>
      {error && <div className="msg msg-err" role="alert">{error}</div>}
      <button className="btn btn-honey" disabled={busy}>{busy ? "Enviando…" : "Enviar hoja de reclamación"}</button>
    </form>
  );
}
