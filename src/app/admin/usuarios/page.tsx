import { createClient } from "@/lib/supabase/server";

export default async function Usuarios() {
  const sb = await createClient();
  const { data } = await sb.from("profiles").select("id,full_name,role,created_at").order("created_at", { ascending: false });
  const rows = (data ?? []) as { id: string; full_name: string | null; role: string; created_at: string }[];
  return (
    <>
      <div className="adm-top"><h1>Usuarios</h1></div>
      <div className="adm-c" style={{ overflowX: "auto" }}>
        <table className="adm-t">
          <thead><tr><th>Nombre</th><th>Rol</th><th>Registro</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}><td>{u.full_name || "—"}</td><td>{u.role === "admin" ? "Administradora" : "Usuario"}</td><td>{new Date(u.created_at).toLocaleDateString("es-PE")}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
