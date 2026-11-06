"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";

export default function BottomNav({ loggedIn, admin }: { loggedIn: boolean; admin: boolean }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const items = [
    { href: "/", label: "Inicio", ico: "home", on: path === "/" },
    { href: "/tienda", label: "Tienda", ico: "storefront", on: path.startsWith("/tienda") },
    { href: "/#guia", label: "Guía", ico: "auto_awesome", on: false },
    loggedIn
      ? { href: admin ? "/admin" : "/cuenta/mis-compras", label: admin ? "Panel" : "Mis materiales", ico: "inventory_2", on: path.startsWith("/cuenta") }
      : { href: "/ingresar", label: "Cuenta", ico: "account_circle", on: path.startsWith("/ingresar") || path.startsWith("/registro") },
  ];
  return (
    <nav className="btab" aria-label="Navegación rápida">
      {items.map((i) => (
        <Link key={i.label} href={i.href} className={i.on ? "on" : ""} aria-current={i.on ? "page" : undefined}>
          <Icon n={i.ico} />{i.label}
        </Link>
      ))}
    </nav>
  );
}
