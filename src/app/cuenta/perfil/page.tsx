import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { Icon } from "@/components/Icons";
import { nameProblem } from "@/lib/safe";

export const metadata = { title: "Mi perfil" };
export const dynamic = "force-dynamic";

async function saveName(formData: FormData) {
  "use server";
  const first = String(formData.get("first") ?? "").trim();
  const last = String(formData.get("last") ?? "").trim();
  const problem = nameProblem("nombres", first) ?? nameProblem("apellidos", last);
  if (problem) redirect(`/cuenta/perfil?err=${encodeURIComponent(problem)}`);
  const sb = await createClient();
  const user = await getUser();
  if (!user) redirect("/ingresar?next=/cuenta/perfil");
  await sb.from("profiles").update({ first_names: first, last_names: last, full_name: `${first} ${last}` }).eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/cuenta/perfil?ok=Datos%20guardados");
}

export default async function Perfil({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/ingresar?next=/cuenta/perfil");
  const { data: p } = await sb.from("profiles").select("full_name,first_names,last_names,terms_accepted_at,created_at").eq("id", user.id).maybeSingle();
  return (
    <div className="wrap" style={{ padding: "40px 28px 64px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 40 }}>Mi perfil</h1>
      {ok && <div className="msg msg-ok" role="status" style={{ marginTop: 14 }}><Icon n="check_circle" />{ok}</div>}
      {err && <div className="msg msg-err" role="alert" style={{ marginTop: 14 }}><Icon n="error" />{err}</div>}
      <form action={saveName} className="box" style={{ display: "grid", gap: 14, marginTop: 18 }}>
        <label className="field">Nombres<input name="first" required minLength={2} maxLength={60} defaultValue={p?.first_names ?? p?.full_name ?? ""} autoComplete="given-name" /></label>
        <label className="field">Apellidos<input name="last" required minLength={2} maxLength={60} defaultValue={p?.last_names ?? ""} autoComplete="family-name" placeholder="Tus apellidos" /></label>
        <label className="field">Correo<input value={user.email ?? ""} readOnly aria-readonly /></label>
        <button className="btn btn-pri" style={{ justifySelf: "start", color: "#fff" }}>Guardar cambios</button>
      </form>
      <div className="box" style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <h3 style={{ fontSize: 20 }}>Seguridad</h3>
        <Link className="btn" href="/cuenta/recuperar" style={{ justifySelf: "start" }}><Icon n="lock_reset" />&nbsp;Cambiar mi contraseña</Link>
      </div>
      <div className="box" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 20 }}>Tus datos</h3>
        <p style={{ color: "var(--muted)", marginBottom: 0 }}>
          Cuenta creada el {p?.created_at ? new Date(p.created_at).toLocaleDateString("es-PE") : "—"}. Términos aceptados el {p?.terms_accepted_at ? new Date(p.terms_accepted_at).toLocaleDateString("es-PE") : "—"}.
          Puedes corregir tu nombre aquí. Para acceder a tus datos, oponerte a su uso o pedir la eliminación de tu cuenta (derechos ARCO), escríbenos y respondemos en un plazo legal. Revisa la <Link href="/info/privacidad" style={{ textDecoration: "underline" }}>política de privacidad</Link>.
        </p>
      </div>
    </div>
  );
}
