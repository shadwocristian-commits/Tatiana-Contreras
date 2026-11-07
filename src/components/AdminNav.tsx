"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";

const items = [
  { href: "/admin", label: "Resumen", ico: "dashboard" },
  { href: "/admin/materiales", label: "Materiales", ico: "inventory_2" },
  { href: "/admin/opiniones", label: "Opiniones", ico: "reviews" },
  { href: "/admin/reclamos", label: "Reclamos", ico: "menu_book" },
  { href: "/admin/usuarios", label: "Usuarios", ico: "group" },
];

export default function AdminNav({ pending }: { pending: number }) {
  const path = usePathname();
  const on = (h: string) => (h === "/admin" ? path === "/admin" : path.startsWith(h));
  return (
    <aside className="adm-s" aria-label="Menú del panel">
      <b>Panel Tatiana</b>
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={on(i.href) ? "on" : ""}>
          <span className="adm-l"><Icon n={i.ico} />{i.label}</span>{i.href === "/admin/opiniones" && pending > 0 ? <em className="adm-badge">{pending}</em> : null}
        </Link>
      ))}
      <span className="off"><span className="adm-l"><Icon n="payments" />Pagos (apagado)</span></span>
      <Link href="/tienda" style={{ marginTop: "auto" }}><span className="adm-l"><Icon n="arrow_back" />Ver tienda</span></Link>
    </aside>
  );
}
