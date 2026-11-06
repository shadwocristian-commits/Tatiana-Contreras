import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Vuelve a "Mis materiales" con un aviso claro en vez de una pantalla en blanco.
function back(req: NextRequest, msg: string) {
  return NextResponse.redirect(new URL(`/cuenta/mis-compras?aviso=${encodeURIComponent(msg)}`, req.nextUrl.origin));
}

// Descarga segura: verifica que el usuario posea el material y redirige a un enlace firmado de 60 s.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/ingresar?next=/cuenta/mis-compras`, req.nextUrl.origin));

  const { data: own } = await sb
    .from("order_items")
    .select("id, orders!inner(user_id,status)")
    .eq("product_id", id)
    .eq("orders.user_id", user.id)
    .in("orders.status", ["paid", "free"])
    .limit(1);
  if (!own?.length) return back(req, "No tienes acceso a este material.");

  const { data: prod } = await sb.from("products").select("file_path,slug").eq("id", id).maybeSingle();
  if (!prod?.file_path) return back(req, "Este material aún no tiene archivo disponible. Intenta de nuevo pronto.");

  const { data: signed, error } = await sb.storage.from("materiales").createSignedUrl(prod.file_path, 60, { download: true });
  if (error || !signed) return back(req, "Este material aún no tiene archivo disponible. Intenta de nuevo pronto.");

  await sb.from("downloads").insert({ user_id: user.id, product_id: id });
  return NextResponse.redirect(signed.signedUrl);
}
