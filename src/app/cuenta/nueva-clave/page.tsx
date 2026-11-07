"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { passwordProblem, PW_MIN } from "@/lib/safe";
import { Icon } from "@/components/Icons";

export default function NuevaClave() {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("pw") ?? "");
    const pp = passwordProblem(pw);
    if (pp) return setMsg({ ok: false, t: pp });
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ ok: false, t: "No se pudo cambiar. El enlace pudo vencer: pide uno nuevo en «Recuperar contraseña»." });
    setDone(true);
    setMsg({ ok: true, t: "Listo, tu contraseña fue actualizada." });
  }
  return (
    <div className="wrap" style={{ padding: "48px 28px", maxWidth: 520 }}>
      <h1 style={{ fontSize: 40 }}>Nueva contraseña</h1>
      <p style={{ color: "var(--muted)" }}>Elige una contraseña segura para tu cuenta.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 12 }}>
        <label className="field">Nueva contraseña
          <input name="pw" type="password" required minLength={PW_MIN} autoComplete="new-password" placeholder={`Mínimo ${PW_MIN}, con letras y números`} disabled={done} />
        </label>
        {msg && <div className={`msg ${msg.ok ? "msg-ok" : "msg-err"}`} role="status"><Icon n={msg.ok ? "check_circle" : "error"} />{msg.t}</div>}
        {done
          ? <Link className="btn btn-pri" href="/tienda" style={{ color: "#fff" }}>Ir a la tienda</Link>
          : <button className="btn btn-pri" disabled={busy}>{busy ? "Guardando…" : "Guardar contraseña"}</button>}
        {!done && <Link href="/cuenta/recuperar" style={{ fontWeight: 700, textDecoration: "underline" }}>Pedir otro enlace</Link>}
      </form>
    </div>
  );
}
