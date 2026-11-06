"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Cierra los menús desplegables (cuenta, ⋯ del panel) al elegir una opción, hacer clic fuera, pulsar Esc o cambiar de página.
const SEL = "details.acct[open], details.adm-menu[open]";
const closeAll = (except?: Element | null) => document.querySelectorAll(SEL).forEach((d) => { if (d !== except) d.removeAttribute("open"); });

export default function AutoClose() {
  const path = usePathname();
  useEffect(() => { closeAll(); }, [path]);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const t = e.target as Element;
      const d = t.closest("details.acct, details.adm-menu");
      if (!d) return closeAll();
      if (t.closest("a, button") && !t.closest("summary")) setTimeout(() => d.removeAttribute("open"), 0);
      else closeAll(d);
    };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") closeAll(); };
    document.addEventListener("click", click);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("click", click); document.removeEventListener("keydown", key); };
  }, []);
  return null;
}
