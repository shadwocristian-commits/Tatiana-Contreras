"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/materiales", label: "Materiales" },
  { href: "/admin/opiniones", label: "Opiniones" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export default function AdminNav({ pending }: { pending: number }) {
  const path = usePathname();
  const on = (h: string) => (h === "/admin" ? path === "/admin" : path.startsWith(h));
  return (
    <aside className="adm-s" aria-label="Menú del panel">
      <b>Panel Tatiana</b>
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={on(i.href) ? "on" : ""}>
          {i.label}{i.href === "/admin/opiniones" && pending > 0 ? <em className="adm-badge">{pending}</em> : null}
        </Link>
      ))}
      <span className="off">Pagos (apagado)</span>
      <Link href="/tienda" style={{ marginTop: "auto" }}>← Ver tienda</Link>
    </aside>
  );
}
