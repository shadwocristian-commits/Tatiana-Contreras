"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

// Captcha de Cloudflare (gratis). Entrega un token que Supabase valida al ingresar.
export default function Turnstile({ onToken }: { onToken: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Clave pública (Site key) de Cloudflare Turnstile del sitio real. La clave secreta vive solo en Supabase.
    const sitekey = "0x4AAAAAAF20yz7tKJrSz_xR";
    let id: string | undefined;
    const mount = () => {
      if (ref.current && window.turnstile && id === undefined) {
        id = window.turnstile.render(ref.current, {
          sitekey,
          callback: onToken,
          size: "flexible",
          theme: "light",
          appearance: "interaction-only",
          language: "es",
          "expired-callback": () => onToken(""),
        });
      }
    };
    if (window.turnstile) mount();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = mount;
      document.head.appendChild(s);
    }
    return () => {
      if (id !== undefined && window.turnstile) window.turnstile.remove(id);
    };
  }, [onToken]);
  return <div ref={ref} className="ts" aria-label="Verificación de seguridad" />;
}
