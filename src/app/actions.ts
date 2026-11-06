"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/");
}

export async function acquireProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect(`/ingresar?next=/tienda/productos/${slug}`);
  const { error } = await sb.rpc("acquire_product", { p_product: id });
  if (error) redirect(`/tienda/productos/${slug}?error=${encodeURIComponent(error.message)}`);
  redirect("/cuenta/mis-compras");
}

export type ReviewState = { ok?: boolean; error?: string };

export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const productId = String(formData.get("product_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!(rating >= 1 && rating <= 5)) return { error: "Elige una calificación de 1 a 5 estrellas." };
  if (comment.length < 3 || comment.length > 1000) return { error: "El comentario debe tener entre 3 y 1000 caracteres." };
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Ingresa a tu cuenta para comentar." };
  const { data: prof } = await sb.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const { error } = await sb.from("reviews").insert({
    product_id: productId, user_id: user.id, rating, comment,
    author_name: prof?.full_name || "Compradora",
  });
  if (error) {
    return { error: error.code === "23505" ? "Ya dejaste un comentario para este material." : "Solo quienes obtuvieron el material pueden comentar." };
  }
  revalidatePath(`/tienda/productos/${slug}`);
  return { ok: true };
}

export async function moderateReview(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reply = String(formData.get("reply") ?? "").trim() || null;
  if (!["approved", "rejected"].includes(status)) return;
  const sb = await createClient();
  await sb.from("reviews").update({ status, admin_reply: reply }).eq("id", id);
  revalidatePath("/admin");
}
