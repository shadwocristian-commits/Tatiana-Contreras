export const metadata = { title: "Política de privacidad" };

export default function Privacidad() {
  return (
    <div className="wrap legal" style={{ padding: "28px 28px 56px", maxWidth: 780 }}>
      <h1 style={{ fontSize: 44 }}>Política de privacidad</h1>
      <p className="msg">Borrador de ejemplo. Debe ser revisado por un abogado antes de publicarse.</p>
      <h2>Datos que recopilamos</h2>
      <p>Nombre, correo electrónico, tus materiales obtenidos y tus opiniones. No solicitamos datos clínicos ni de pacientes.</p>
      <h2>Para qué los usamos</h2>
      <p>Para crear tu cuenta, permitirte descargar tus materiales, mostrar tus opiniones y comunicarnos contigo sobre tu cuenta.</p>
      <h2>Marco legal</h2>
      <p>Tratamos tus datos conforme a la Ley N.º 29733, Ley de Protección de Datos Personales del Perú, y su reglamento.</p>
      <h2>Con quién se comparten</h2>
      <p>Usamos proveedores de infraestructura (Supabase, Vercel, Cloudflare Turnstile) que procesan datos únicamente para operar el sitio. No vendemos tus datos.</p>
      <h2>Tus derechos</h2>
      <p>Puedes solicitar acceso, rectificación, cancelación u oposición escribiéndonos al correo de contacto de la tienda.</p>
      <h2>Seguridad</h2>
      <p>Los archivos se entregan mediante enlaces temporales y las contraseñas se almacenan cifradas.</p>
    </div>
  );
}
