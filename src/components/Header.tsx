import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import NavMenu from "./NavMenu";
import BottomNav from "./BottomNav";
import { Icon } from "./Icons";
import type { Category } from "@/lib/types";

export default async function Header() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  let admin = false;
  let name = "";
  if (user) {
    const { data } = await sb.from("profiles").select("role,full_name").eq("id", user.id).maybeSingle();
    admin = data?.role === "admin";
    name = data?.full_name || user.email?.split("@")[0] || "Mi cuenta";
  }
  const { data: cats } = await sb.from("categories").select("slug,name,area").order("sort");
  return (
    <>
      <div className="promo"><Icon n="bolt" />Descarga inmediata<span className="hide-m"> · Materiales para terapia clínica y educativa</span></div>
      <header className="hdr" style={{ position: "sticky" }}>
        <div className="wrap hdr-in" style={{ position: "relative" }}>
          <Link href="/" className="brand"><img src="/images/logo.png" alt="Logo Materiales de Tatiana" /><span>Materiales de Tatiana</span></Link>
          <Suspense fallback={null}><NavMenu cats={(cats ?? []) as Category[]} loggedIn={!!user} admin={admin} name={name} /></Suspense>
        </div>
      </header>
      <BottomNav loggedIn={!!user} admin={admin} />
    </>
  );
}
