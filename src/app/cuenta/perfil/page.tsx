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

async function saveDelivery(formData: FormData) {
  "use server";
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const back = (m: string) => redirect(`/cuenta/perfil?err=${encodeURIComponent(m)}#entrega`);
  const doc_tipo = g("doc_tipo"), doc_num = g("doc_num").replace(/\s/g, "");
  const telefono = g("telefono").replace(/[\s-]/g, "").replace(/^\+?51/, "");
  const fecha = g("fecha_nacimiento");
  if (!["DNI", "CE", "Pasaporte"].includes(doc_tipo)) back("Elige el tipo de documento.");
  if (doc_tipo === "DNI" && !/^[0-9]{8}$/.test(doc_num)) back("El DNI debe tener 8 números.");
  if (doc_num.length < 6 || doc_num.length > 20) back("Revisa el número de documento.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha < "1900-01-01" || fecha > new Date().toISOString().slice(0, 10)) back("Revisa la fecha de nacimiento.");
  if (!/^[0-9]{9}$/.test(telefono)) back("El teléfono debe tener 9 números, por ejemplo 987654321.");
  const direccion = g("direccion"), distrito = g("distrito"), ciudad = g("ciudad"), referencia = g("referencia");
  if (direccion.length < 5 || direccion.length > 200) back("Escribe tu dirección completa (calle, número).");
  if (distrito.length < 2 || ciudad.length < 2) back("Indica distrito y ciudad.");
  const sb = await createClient();
  const user = await getUser();
  if (!user) redirect("/ingresar?next=/cuenta/perfil");
  const { error } = await sb.from("datos_entrega").upsert({ user_id: user.id, doc_tipo, doc_num, fecha_nacimiento: fecha, telefono, direccion, distrito: distrito.slice(0, 80), ciudad: ciudad.slice(0, 80), referencia: referencia ? referencia.slice(0, 200) : null, updated_at: new Date().toISOString() });
  if (error) back("No se pudo guardar. Revisa los datos e inténtalo otra vez.");
  redirect("/cuenta/perfil?ok=Datos%20de%20entrega%20guardados#entrega");
}

async function deleteDelivery() {
  "use server";
  const sb = await createClient();
  const user = await getUser();
  if (!user) redirect("/ingresar?next=/cuenta/perfil");
  await sb.from("datos_entrega").delete().eq("user_id", user.id);
  redirect("/cuenta/perfil?ok=Datos%20de%20entrega%20eliminados#entrega");
}

export default async function Perfil({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/ingresar?next=/cuenta/perfil");
  const { data: p } = await sb.from("profiles").select("full_name,first_names,last_names,terms_accepted_at,created_at").eq("id", user.id).maybeSingle();
  const { data: d } = await sb.from("datos_entrega").select("*").eq("user_id", user.id).maybeSingle();
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
      <form id="entrega" action={saveDelivery} className="box" style={{ display: "grid", gap: 14, marginTop: 16 }}>
        <h3 style={{ fontSize: 20 }}>Datos de entrega</h3>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>Por ahora son opcionales. Los usaremos solo para gestionar tus pedidos y entregas. Solo tú puedes verlos y puedes borrarlos cuando quieras.</p>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 12 }}>
          <label className="field">Documento<select name="doc_tipo" defaultValue={d?.doc_tipo ?? "DNI"}><option>DNI</option><option>CE</option><option>Pasaporte</option></select></label>
          <label className="field">Número<input name="doc_num" required minLength={6} maxLength={20} defaultValue={d?.doc_num ?? ""} inputMode="numeric" autoComplete="off" /></label>
        </div>
        <label className="field">Fecha de nacimiento<input type="date" name="fecha_nacimiento" required min="1900-01-01" max={new Date().toISOString().slice(0, 10)} defaultValue={d?.fecha_nacimiento ?? ""} autoComplete="bday" /></label>
        <label className="field">Teléfono (9 dígitos)<input name="telefono" required inputMode="tel" maxLength={16} defaultValue={d?.telefono ?? ""} autoComplete="tel-national" placeholder="987654321" /></label>
        <label className="field">Dirección (calle y número)<input name="direccion" required minLength={5} maxLength={200} defaultValue={d?.direccion ?? ""} autoComplete="street-address" /></label>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
          <label className="field">Distrito<input name="distrito" required minLength={2} maxLength={80} defaultValue={d?.distrito ?? ""} /></label>
          <label className="field">Ciudad<input name="ciudad" required minLength={2} maxLength={80} defaultValue={d?.ciudad ?? ""} autoComplete="address-level2" /></label>
        </div>
        <label className="field">Referencia (opcional)<input name="referencia" maxLength={200} defaultValue={d?.referencia ?? ""} placeholder="Frente al parque, casa de reja negra…" /></label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-pri" style={{ color: "#fff" }}>Guardar datos de entrega</button>
          {d && <button className="btn" formAction={deleteDelivery} formNoValidate>Borrar mis datos de entrega</button>}
        </div>
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
