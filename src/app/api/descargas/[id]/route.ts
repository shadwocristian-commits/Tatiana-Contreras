import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  if (!own?.length) return new NextResponse("No tienes acceso a este material.", { status: 403 });

  const { data: prod } = await sb.from("products").select("file_path,slug").eq("id", id).maybeSingle();
  if (!prod?.file_path) return new NextResponse("Archivo no disponible todavía.", { status: 404 });

  const { data: signed, error } = await sb.storage.from("materiales").createSignedUrl(prod.file_path, 60, { download: true });
  if (error || !signed) return new NextResponse("Archivo no disponible todavía.", { status: 404 });

  await sb.from("downloads").insert({ user_id: user.id, product_id: id });
  return NextResponse.redirect(signed.signedUrl);
}
