"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Turnstile from "./Turnstile";
import { Icon } from "./Icons";

export default function AccessCard({ initial = "ingresar", next = "/tienda" }: { initial?: "ingresar" | "registro"; next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"ingresar" | "registro">(initial);
  const [token, setToken] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setOk("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (!token) return setError("Completa la verificación de seguridad.");
    if (mode === "registro") {
      if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
      if (!terms) return setError("Debes aceptar los términos y condiciones.");
    }
    setBusy(true);
    const sb = createClient();
    if (mode === "ingresar") {
      const { error: err } = await sb.auth.signInWithPassword({ email, password, options: { captchaToken: token } });
      setBusy(false);
      if (err) return setError("Correo o contraseña incorrectos.");
      router.push(next); router.refresh();
    } else {
      const { data, error: err } = await sb.auth.signUp({
        email, password,
        options: {
          captchaToken: token,
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: { full_name: String(f.get("name") ?? "").trim(), terms_accepted: true },
        },
      });
      setBusy(false);
      if (err) return setError("No se pudo crear la cuenta. Revisa los datos e inténtalo otra vez.");
      if (data.session) { router.push(next); router.refresh(); }
      else setOk("Cuenta creada. Revisa tu correo para confirmarla.");
    }
  }

  async function google() {
    const sb = createClient();
    await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } });
  }

  return (
    <section id="acceso" className="access" aria-label="Acceso a tu cuenta">
      <div>
        <h2 style={{ fontSize: 30 }}>{mode === "ingresar" ? "Bienvenida de nuevo" : "Crea tu cuenta gratis"}</h2>
        <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{mode === "ingresar" ? "Entra para ver y descargar tus materiales." : "Descarga materiales y deja tu opinión."}</p>
      </div>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "ingresar"} className={mode === "ingresar" ? "on" : ""} onClick={() => setMode("ingresar")}>Ingresar</button>
        <button type="button" role="tab" aria-selected={mode === "registro"} className={mode === "registro" ? "on" : ""} onClick={() => setMode("registro")}>Crear cuenta</button>
      </div>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mode === "registro" && (
          <label className="field">Nombre<input name="name" autoComplete="name" required placeholder="Tu nombre" /></label>
        )}
        <label className="field">Correo<input name="email" type="email" autoComplete="email" required placeholder="tucorreo@ejemplo.com" /></label>
        <label className="field">Contraseña<input name="password" type="password" autoComplete={mode === "ingresar" ? "current-password" : "new-password"} required minLength={mode === "registro" ? 8 : undefined} placeholder="••••••••" /></label>
        {mode === "registro" && (
          <label className="chk">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>Acepto los <Link href="/info/terminos" target="_blank" style={{ textDecoration: "underline" }}>términos y condiciones</Link> y la <Link href="/info/privacidad" target="_blank" style={{ textDecoration: "underline" }}>política de privacidad</Link>.</span>
          </label>
        )}
        <Turnstile onToken={setToken} />
        {error && <div className="msg msg-err" role="alert"><Icon n="error" />{error}</div>}
        {ok && <div className="msg msg-ok" role="status"><Icon n="check_circle" />{ok}</div>}
        <button className="btn btn-pri" type="submit" disabled={busy}>{busy ? "Un momento…" : mode === "ingresar" ? "Ingresar" : "Crear cuenta"}</button>
      </form>
      {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
        <button className="btn" type="button" onClick={google}>Continuar con Google</button>
      )}
    </section>
  );
}
