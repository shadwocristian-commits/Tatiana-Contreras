"use client";
import { useEffect, useRef, type ReactNode } from "react";

// Barra de cristal con una píldora que se desliza hasta la opción activa (.on, aria-current o aria-selected).
export default function Glass({ children, className = "", as = "div", ...rest }: { children: ReactNode; className?: string; as?: "div" | "nav"; role?: string; "aria-label"?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const a = el.querySelector<HTMLElement>('.on,[aria-current="page"],[aria-selected="true"]');
      if (!a) return void el.style.setProperty("--o", "0");
      el.style.setProperty("--x", `${a.offsetLeft}px`);
      el.style.setProperty("--w", `${a.offsetWidth}px`);
      el.style.setProperty("--o", "1");
    };
    measure();
    const raf = requestAnimationFrame(() => el.classList.add("ready"));
    const ro = new ResizeObserver(measure); ro.observe(el);
    const mo = new MutationObserver(measure); mo.observe(el, { subtree: true, attributes: true, attributeFilter: ["class", "aria-current", "aria-selected"] });
    document.fonts?.ready.then(measure);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); };
  }, []);
  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={`glass ${className}`} {...rest}>
      <span className="glass-pill" aria-hidden />
      {children}
    </Tag>
  );
}
