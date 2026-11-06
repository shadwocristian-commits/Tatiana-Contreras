"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { passwordProblem, PW_MIN } from "@/lib/safe";

export default function NuevaClave() {
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("pw"));
    const pp = passwordProblem(pw);
    if (pp) return setMsg(pp);
    const { error } = await createClient().auth.updateUser({ password: pw });
    if (error) return setMsg("No se pudo cambiar. Abre de nuevo el enlace del correo.");
    setOk(true); setMsg("Listo, tu contraseña fue actualizada.");
  }
  return (
    <div className="wrap" style={{ padding: "48px 28px", maxWidth: 520 }}>
      <h1 style={{ fontSize: 40 }}>Nueva contraseña</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="pw" type="password" required minLength={PW_MIN} autoComplete="new-password" placeholder="Nueva contraseña (mín. 10, letras y números)" className="adm-in" />
        <button className="btn btn-pri" disabled={ok}>Guardar contraseña</button>
        {msg && <p role="status" style={{ margin: 0, fontWeight: 700 }}>{msg}</p>}
      </form>
    </div>
  );
}
