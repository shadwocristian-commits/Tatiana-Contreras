import ReclamoForm from "@/components/ReclamoForm";
import { PROVEEDOR } from "@/lib/legal";

export const metadata = { title: "Libro de Reclamaciones" };

export default function Libro() {
  return (
    <div className="wrap" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <h1 style={{ marginBottom: 6 }}>Libro de Reclamaciones</h1>
      <p style={{ margin: "0 0 18px", maxWidth: 720 }}>
        Conforme al Código de Protección y Defensa del Consumidor, puedes registrar aquí un reclamo o una queja. Te responderemos en un plazo máximo de {PROVEEDOR.plazoDias} días calendario.
      </p>
      <div style={{ maxWidth: 760, marginBottom: 16, background: "var(--cream)", border: "1.5px solid var(--line)", borderRadius: 16, padding: "12px 16px", display: "block", fontSize: 14 }}>
        <b>Proveedor:</b> {PROVEEDOR.nombre}
        {PROVEEDOR.ruc && <> · <b>RUC:</b> {PROVEEDOR.ruc}</>}
        {PROVEEDOR.domicilio && <> · <b>Domicilio:</b> {PROVEEDOR.domicilio}</>}
        <br /><small>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante INDECOPI.</small>
      </div>
      <ReclamoForm plazo={PROVEEDOR.plazoDias} />
    </div>
  );
}
