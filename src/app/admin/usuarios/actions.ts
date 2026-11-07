"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function done(kind: "ok" | "err", msg: string): never {
  redirect(`/admin/usuarios?${kind}=${encodeURIComponent(msg)}`);
}

async function rpc(fn: string, args: Record<string, unknown>, okMsg: string) {
  const sb = await createClient();
  const { error } = await sb.rpc(fn, args);
  revalidatePath("/admin/usuarios");
  if (error) done("err", error.message.includes("forbidden") ? "No tienes permiso." : error.message);
  done("ok", okMsg);
}

export async function setSuspended(fd: FormData) {
  const suspend = fd.get("suspend") === "1";
  await rpc("admin_set_suspended", { target: String(fd.get("id")), suspend }, suspend ? "Cuenta suspendida." : "Cuenta reactivada.");
}

export async function deleteUser(fd: FormData) {
  if (String(fd.get("confirm")).trim() !== "ELIMINAR") done("err", "Escribe ELIMINAR para confirmar.");
  await rpc("admin_delete_user", { target: String(fd.get("id")) }, "Cuenta eliminada.");
}

export async function setRole(fd: FormData) {
  const email = String(fd.get("email") ?? "");
  const role = fd.get("role") === "cliente" ? "cliente" : "admin";
  await rpc("admin_set_role", { target_email: email, new_role: role }, role === "admin" ? "Acceso de administradora concedido." : "Acceso de administradora retirado.");
}

export async function sendReset(fd: FormData) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) done("err", "Sesión vencida.");
  const { data: me } = await sb.from("profiles").select("role").eq("id", user!.id).maybeSingle();
  if (me?.role !== "admin") done("err", "No tienes permiso.");
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const email = String(fd.get("email"));
  const captchaToken = String(fd.get("token") ?? "");
  if (!captchaToken) done("err", "No se pudo verificar la seguridad. Inténtalo otra vez.");
  const { error } = await sb.auth.resetPasswordForEmail(email, { captchaToken, redirectTo: `${origin}/auth/callback?next=/cuenta/nueva-clave` });
  if (error) done("err", "No se pudo enviar el correo. Revisa la configuración de correo.");
  done("ok", `Correo de restablecimiento enviado a ${email}.`);
}
