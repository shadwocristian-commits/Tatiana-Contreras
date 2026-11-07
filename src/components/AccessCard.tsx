"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Turnstile from "./Turnstile";
import { safeNext, passwordProblem, nameProblem, PW_MIN } from "@/lib/safe";
import { Icon } from "./Icons";
import Glass from "./Glass";

export default function AccessCard({ initial = "ingresar", next = "/tienda" }: { initial?: "ingresar" | "registro"; next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"ingresar" | "registro">(initial);
  const [token, setToken] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [tk, setTk] = useState(0);
  const [fails, setFails] = useState(0);
  const [until, setUntil] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setOk("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (Date.now() < until) return setError(`Demasiados intentos. Espera ${Math.ceil((until - Date.now()) / 1000)} segundos.`);
    if (!token) return setError("Completa la verificación de seguridad.");
    if (mode === "registro") {
      const np = nameProblem("nombres", String(f.get("first") ?? "")) ?? nameProblem("apellidos", String(f.get("last") ?? ""));
      if (np) return setError(np);
      const pp = passwordProblem(password);
      if (pp) return setError(pp);
      if (!terms) return setError("Debes aceptar los términos y condiciones.");
    }
    setBusy(true);
    const sb = createClient();
    if (mode === "ingresar") {
      const { error: err } = await sb.auth.signInWithPassword({ email, password, options: { captchaToken: token } });
      setBusy(false);
      if (err) {
        const n = fails + 1; setFails(n); setToken(""); setTk((k) => k + 1);
        if (n >= 5) { setUntil(Date.now() + 60000); setFails(0); return setError("Demasiados intentos. Espera 1 minuto."); }
        return setError("Correo o contraseña incorrectos.");
      }
      router.push(safeNext(next)); router.refresh();
    } else {
      const { data, error: err } = await sb.auth.signUp({
        email, password,
        options: {
          captchaToken: token,
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            first_names: String(f.get("first") ?? "").trim(),
            last_names: String(f.get("last") ?? "").trim(),
            terms_accepted: true,
          },
        },
      });
      setBusy(false); setToken(""); setTk((k) => k + 1);
      if (err) return setError("No se pudo crear la cuenta. Revisa los datos e inténtalo otra vez.");
      if (data.session) { router.push(next); router.refresh(); }
      else setOk("Cuenta creada. Te enviamos un enlace para confirmar tu correo: ábrelo para activar tu cuenta.");
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
      <Glass className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "ingresar"} className={mode === "ingresar" ? "on" : ""} onClick={() => setMode("ingresar")}>Ingresar</button>
        <button type="button" role="tab" aria-selected={mode === "registro"} className={mode === "registro" ? "on" : ""} onClick={() => setMode("registro")}>Crear cuenta</button>
      </Glass>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mode === "registro" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label className="field">Nombres<input name="first" autoComplete="given-name" required maxLength={60} placeholder="Ej. María Fernanda" /></label>
            <label className="field">Apellidos<input name="last" autoComplete="family-name" required maxLength={60} placeholder="Ej. Quispe Rojas" /></label>
          </div>
        )}
        <label className="field">Correo<input name="email" type="email" autoComplete="email" required placeholder="tucorreo@ejemplo.com" />{mode === "registro" && <small style={{ color: "var(--muted)", fontWeight: 600 }}>Te enviaremos un enlace para confirmarlo.</small>}</label>
        <label className="field">Contraseña<input name="password" type="password" autoComplete={mode === "ingresar" ? "current-password" : "new-password"} required minLength={mode === "registro" ? PW_MIN : undefined} placeholder="••••••••" />{mode === "registro" && <small style={{ color: "var(--muted)", fontWeight: 600 }}>Mínimo {PW_MIN} caracteres, con letras y números.</small>}</label>
        {mode === "ingresar" && <Link href="/cuenta/recuperar" style={{ fontSize: 14, fontWeight: 700, textDecoration: "underline", alignSelf: "flex-start" }}>¿Olvidaste tu contraseña?</Link>}
        {mode === "registro" && (
          <label className="chk">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>Acepto los <Link href="/info/terminos" target="_blank" style={{ textDecoration: "underline" }}>términos y condiciones</Link> y la <Link href="/info/privacidad" target="_blank" style={{ textDecoration: "underline" }}>política de privacidad</Link>.</span>
          </label>
        )}
        <Turnstile key={tk} onToken={setToken} />
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
