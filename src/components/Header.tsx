import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavMenu from "./NavMenu";
import type { Category } from "@/lib/types";

export default async function Header() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  let admin = false;
  if (user) {
    const { data } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
    admin = data?.role === "admin";
  }
  const { data: cats } = await sb.from("categories").select("slug,name,area").order("sort");
  return (
    <>
      <div className="promo">Descarga inmediata<span className="hide-m"> · Materiales para terapia clínica y educativa</span></div>
      <header className="hdr" style={{ position: "sticky" }}>
        <div className="wrap hdr-in" style={{ position: "relative" }}>
          <Link href="/" className="brand"><img src="/images/logo.png" alt="Logo Materiales de Tatiana" /><span>Materiales de Tatiana</span></Link>
          <NavMenu cats={(cats ?? []) as Category[]} loggedIn={!!user} admin={admin} />
        </div>
      </header>
    </>
  );
}
