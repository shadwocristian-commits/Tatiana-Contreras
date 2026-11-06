"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Turnstile from "@/components/Turnstile";
import { Icon } from "@/components/Icons";

export default function Recuperar() {
  const [token, setToken] = useState("");
  const [tk, setTk] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!token) return setMsg({ ok: false, t: "Completa la verificación de seguridad." });
    setBusy(true);
    await createClient().auth.resetPasswordForEmail(email, { captchaToken: token, redirectTo: `${location.origin}/auth/callback?next=/cuenta/nueva-clave` });
    setBusy(false); setToken(""); setTk((k) => k + 1);
    // Mismo mensaje exista o no la cuenta, para no revelar quién está registrada.
    setMsg({ ok: true, t: "Si ese correo tiene cuenta, te enviamos un enlace para crear una contraseña nueva. Revisa también spam." });
  }
  return (
    <div className="wrap" style={{ padding: "48px 28px", maxWidth: 520 }}>
      <h1 style={{ fontSize: 40 }}>Recuperar contraseña</h1>
      <p style={{ color: "var(--muted)" }}>Escribe tu correo y te enviaremos un enlace seguro.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 14, marginTop: 12 }}>
        <label className="field">Correo<input name="email" type="email" required autoComplete="email" placeholder="tucorreo@ejemplo.com" /></label>
        <Turnstile key={tk} onToken={setToken} />
        {msg && <div className={`msg ${msg.ok ? "msg-ok" : "msg-err"}`} role="status"><Icon n={msg.ok ? "check_circle" : "error"} />{msg.t}</div>}
        <button className="btn btn-pri" disabled={busy}>{busy ? "Enviando…" : "Enviar enlace"}</button>
        <Link href="/ingresar" style={{ fontWeight: 700, textDecoration: "underline" }}>Volver a ingresar</Link>
      </form>
    </div>
  );
}
