"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav({ loggedIn, admin }: { loggedIn: boolean; admin: boolean }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const items = [
    { href: "/", label: "Inicio", ico: "⌂", on: path === "/" },
    { href: "/tienda", label: "Tienda", ico: "▦", on: path.startsWith("/tienda") },
    { href: "/#guia", label: "Guía", ico: "★", on: false },
    loggedIn
      ? { href: admin ? "/admin" : "/cuenta/mis-compras", label: admin ? "Panel" : "Mis materiales", ico: "☺", on: path.startsWith("/cuenta") }
      : { href: "/ingresar", label: "Cuenta", ico: "☺", on: path.startsWith("/ingresar") || path.startsWith("/registro") },
  ];
  return (
    <nav className="btab" aria-label="Navegación rápida">
      {items.map((i) => (
        <Link key={i.label} href={i.href} className={i.on ? "on" : ""} aria-current={i.on ? "page" : undefined}>
          <b aria-hidden>{i.ico}</b>{i.label}
        </Link>
      ))}
    </nav>
  );
}
