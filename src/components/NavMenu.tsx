"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import type { Category } from "@/lib/types";

export default function NavMenu({ cats, loggedIn, admin }: { cats: Category[]; loggedIn: boolean; admin: boolean }) {
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
      <Link className="mi" href="/tienda?area=clinica" onClick={close}>Clínica</Link>
      <Link className="mi" href="/tienda?area=educativa" onClick={close}>Educativa</Link>
    </div>
  );
  return (
    <>
      <nav className="nav" aria-label="Principal">
        <button className="navb" aria-expanded={open} aria-controls="mega" onClick={() => setOpen(!open)}>Tienda ▾</button>
        <Link className="navb" href="/tienda?area=clinica" onClick={close}>Clínica</Link>
        <Link className="navb" href="/tienda?area=educativa" onClick={close}>Educativa</Link>
        <Link className="navb" href="/tienda?gratis=1" onClick={close}>Gratis</Link>
        <Link className="navb" href="/#autora" onClick={close}>Sobre Tatiana</Link>
      </nav>
      <div className="actions">
        {loggedIn ? (
          <>
            {admin && <Link className="btn" href="/admin" style={{ minHeight: 44 }}>Panel</Link>}
            <Link className="btn" href="/cuenta/mis-compras" style={{ minHeight: 44 }}>Mis materiales</Link>
            <form action={signOut}><button className="btn btn-pri" style={{ minHeight: 44 }}>Salir</button></form>
          </>
        ) : (
          <>
            <Link className="btn" href="/registro" style={{ minHeight: 44 }}>Crear cuenta</Link>
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
