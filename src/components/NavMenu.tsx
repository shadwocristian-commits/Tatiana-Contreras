"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { Icon } from "./Icons";
import type { Category } from "@/lib/types";

export default function NavMenu({ cats, loggedIn, admin, name }: { cats: Category[]; loggedIn: boolean; admin: boolean; name: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const terapias = (
    <div className="mega-col">
      <h3>Tipo de terapia</h3>
      {cats.map((c) => (
        <Link key={c.slug} className="mi" href={`/tienda?cat=${c.slug}`} onClick={close}>{c.name}</Link>
      ))}
      <Link className="mi" href="/tienda" onClick={close} style={{ fontWeight: 800 }}>Ver todo</Link>
    </div>
  );
  const areas = (
    <div className="mega-col">
      <h3>Área</h3>
      <Link className="mi" href="/tienda?area=clinica" onClick={close}><Icon n="psychology" />Clínica</Link>
      <Link className="mi" href="/tienda?area=educativa" onClick={close}><Icon n="school" />Educativa</Link>
    </div>
  );
  return (
    <>
      <nav className="nav" aria-label="Principal">
        <button className="navb" aria-expanded={open} aria-controls="mega" onClick={() => setOpen(!open)}><Icon n="storefront" />Tienda<Icon n="expand_more" /></button>
        <Link className="navb" href="/tienda?area=clinica" onClick={close}><Icon n="psychology" />Clínica</Link>
        <Link className="navb" href="/tienda?area=educativa" onClick={close}><Icon n="school" />Educativa</Link>
        <Link className="navb" href="/tienda?gratis=1" onClick={close}><Icon n="redeem" />Gratis</Link>
        <Link className="navb" href="/#guia" onClick={close}><Icon n="help" />Cómo funciona</Link>
      </nav>
      <div className="actions">
        {loggedIn ? (
          <details className="acct">
            <summary aria-label="Menú de mi cuenta"><i>{name.charAt(0).toUpperCase()}</i><span className="acct-n">{name.split(" ")[0]}</span><Icon n="expand_more" /></summary>
            <div className="acct-pop">
              {admin && <Link href="/admin"><Icon n="admin_panel_settings" />Panel de administración</Link>}
              <Link href="/cuenta/mis-compras"><Icon n="inventory_2" />Mis materiales</Link>
              <form action={signOut}><button className="out"><Icon n="logout" />Salir</button></form>
            </div>
          </details>
        ) : (
          <>
            <Link className="btn hide-m" href="/registro" style={{ minHeight: 44 }}>Crear cuenta</Link>
            <Link className="btn btn-pri" href="/ingresar" style={{ minHeight: 44, color: "#fff" }}>Ingresar</Link>
          </>
        )}
      </div>
      {open && (
        <div id="mega" className="mega">
          <div className="wrap mega-in">
            {terapias}
            {areas}
            <div className="mega-promo">
              <h3 style={{ fontSize: 24 }}>Materiales gratis</h3>
              <span style={{ fontSize: 14 }}>Descarga y prueba los materiales sin costo.</span>
              <Link className="btn btn-pri" href="/tienda?gratis=1" onClick={close} style={{ alignSelf: "flex-start", color: "#fff" }}>Ver gratis</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
