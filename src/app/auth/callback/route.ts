import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Confirma el correo o el ingreso con Google y vuelve a la tienda.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (code) {
    const sb = await createClient();
    await sb.auth.exchangeCodeForSession(code);
  }
  const next = req.nextUrl.searchParams.get("next") ?? "";
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/tienda";
  return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
}
