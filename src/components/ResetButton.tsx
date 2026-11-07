"use client";
import { useEffect, useRef, useState } from "react";
import Turnstile from "./Turnstile";
import { Icon } from "./Icons";

// Supabase pide verificación de seguridad también para este correo: se hace sola al pulsar y se envía de inmediato.
export default function ResetButton({ email, action }: { email: string; action: (fd: FormData) => void | Promise<void> }) {
  const [on, setOn] = useState(false);
  const [token, setToken] = useState("");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (token) ref.current?.requestSubmit(); }, [token]);
  return (
    <form ref={ref} action={action} data-keep>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      {on
        ? <div style={{ padding: "10px 14px", fontWeight: 700 }} role="status"><Icon n="hourglass_top" />&nbsp;Verificando y enviando…<Turnstile onToken={setToken} /></div>
        : <button type="button" onClick={() => setOn(true)}><Icon n="mail" />Enviar correo para restablecer contraseña</button>}
    </form>
  );
}
