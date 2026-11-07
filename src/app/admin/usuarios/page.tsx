import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { Icon } from "@/components/Icons";
import Glass from "@/components/Glass";
import { setSuspended, deleteUser, setRole, sendReset } from "./actions";
import ResetButton from "@/components/ResetButton";

export const dynamic = "force-dynamic";
type U = { id: string; email: string; full_name: string | null; role: string; created_at: string; banned_until: string | null; confirmed: boolean };

export default async function Usuarios({ searchParams }: { searchParams: Promise<{ f?: string; q?: string; ok?: string; err?: string }> }) {
  const { f = "todos", q = "", ok, err } = await searchParams;
  const sb = await createClient();
  const user = await getUser();
  const { data } = await sb.rpc("admin_list_users");
  const all = (data ?? []) as U[];
  const susp = (u: U) => !!u.banned_until && new Date(u.banned_until) > new Date();
  const term = q.trim().toLowerCase();
  const rows = all.filter((u) =>
    (f === "admin" ? u.role === "admin" : f === "suspendidos" ? susp(u) : true) &&
    (!term || (u.full_name ?? "").toLowerCase().includes(term) || u.email.toLowerCase().includes(term)));
  const tab = (k: string, label: string, n: number) => <Link key={k} href={`/admin/usuarios?f=${k}`} className={f === k ? "on" : ""}>{label} · {n}</Link>;
  return (
    <>
      <div className="adm-top"><h1>Usuarios</h1></div>
      {ok && <div className="adm-msg ok" role="status">{ok}</div>}
      {err && <div className="adm-msg err" role="alert">{err}</div>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Glass as="nav" className="adm-tabs" aria-label="Filtros">
          {tab("todos", "Todos", all.length)}
          {tab("admin", "Equipo admin", all.filter((u) => u.role === "admin").length)}
          {tab("suspendidos", "Suspendidos", all.filter(susp).length)}
        </Glass>
        <form action="/admin/usuarios" style={{ display: "flex", gap: 8 }}>
          <input type="hidden" name="f" value={f} />
          <input className="adm-in" name="q" defaultValue={q} placeholder="Buscar por nombre o correo…" style={{ minWidth: 240 }} />
        </form>
      </div>
      <div className="adm-c" style={{ overflow: "visible" }}>
        <div style={{ overflowX: "auto", paddingBottom: 260, marginBottom: -240 }}>
          <table className="adm-t">
            <thead><tr><th>Persona</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {rows.map((u) => {
                const isMe = u.id === user?.id, isAdmin = u.role === "admin", s = susp(u);
                return (
                  <tr key={u.id}>
                    <td><span style={{ display: "flex", gap: 10, alignItems: "center" }}><span className="adm-av">{(u.full_name || u.email)[0]?.toUpperCase()}</span><b>{u.full_name || "—"}</b></span></td>
                    <td>{u.email}</td>
                    <td><span className={`adm-st ${isAdmin ? "warn" : ""}`}>{isAdmin ? "Administración" : "Cliente"}</span></td>
                    <td><span className={`adm-st ${s ? "bad" : u.confirmed ? "ok" : "warn"}`}>{s ? "Suspendida" : u.confirmed ? "Activa" : "Sin confirmar"}</span></td>
                    <td>
                      {isMe ? <small style={{ color: "var(--muted)" }}>Tú</small> : (
                        <details className="adm-menu">
                          <summary aria-label={`Acciones para ${u.email}`}>⋯</summary>
                          <div className="adm-pop">
                            <ResetButton email={u.email} action={sendReset} />
                            {isAdmin
                              ? <form action={setRole}><input type="hidden" name="email" value={u.email} /><input type="hidden" name="role" value="cliente" /><button><Icon n="remove_moderator" />Quitar acceso de administración</button></form>
                              : <form action={setRole}><input type="hidden" name="email" value={u.email} /><input type="hidden" name="role" value="admin" /><button><Icon n="admin_panel_settings" />Dar acceso de administración</button></form>}
                            <form action={setSuspended}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="suspend" value={s ? "0" : "1"} /><button>{s ? <><Icon n="play_circle" />Reactivar cuenta</> : <><Icon n="pause_circle" />Suspender cuenta</>}</button></form>
                            {!isAdmin && (
                              <form action={deleteUser} className="del">
                                <b style={{ color: "var(--danger)", fontSize: 14 }}>Eliminar cuenta</b>
                                <small>Se borra la cuenta y su historial. No se puede deshacer.</small>
                                <input type="hidden" name="id" value={u.id} />
                                <input className="adm-in" name="confirm" required pattern="ELIMINAR" title="Escribe ELIMINAR" placeholder="Escribe ELIMINAR" />
                                <button className="btn btn-danger" style={{ all: "unset", cursor: "pointer", background: "var(--danger)", color: "#fff", borderRadius: 999, padding: "10px 16px", textAlign: "center", fontWeight: 800 }}>Eliminar definitivamente</button>
                              </form>
                            )}
                          </div>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={5}>No hay resultados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <section className="adm-c adm-add" aria-label="Agregar administradora">
        <div className="adm-add-h"><span className="adm-add-i"><Icon n="shield_person" /></span><div><h2>Agregar administradora</h2><p>Escribe el correo de una persona que ya creó su cuenta. Entrará con su propio usuario y verá el panel.</p></div></div>
        <form action={setRole} className="adm-add-f">
          <input type="hidden" name="role" value="admin" />
          <input className="adm-in" type="email" name="email" required placeholder="correo@ejemplo.com" aria-label="Correo de la nueva administradora" />
          <button className="btn btn-pri" style={{ color: "#fff" }}><Icon n="person_add" />&nbsp;Dar acceso al panel</button>
        </form>
        <ul className="adm-rules">
          <li><Icon n="lock" />No puedes quitarte tu propio acceso</li>
          <li><Icon n="group" />Siempre queda al menos 1 administradora</li>
          <li><Icon n="history" />Cada cambio queda registrado</li>
        </ul>
        <div className="adm-add-l">
          <b>Equipo actual</b>
          {all.filter((u) => u.role === "admin").map((u) => (
            <div key={u.id} className="adm-add-r"><span className="adm-av">{(u.full_name || u.email)[0]?.toUpperCase()}</span><span><b>{u.full_name || u.email}</b><small>{u.email} · desde {new Date(u.created_at).toLocaleDateString("es-PE")}</small></span></div>
          ))}
        </div>
      </section>
    </>
  );
}
