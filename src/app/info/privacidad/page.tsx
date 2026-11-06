import LegalLayout, { type Sec } from "@/components/LegalLayout";

export const metadata = { title: "Política de privacidad" };

const secs: Sec[] = [
  { id: "datos", title: "Datos que recopilamos", body: <p>Nombre, correo electrónico, los materiales que obtienes y tus opiniones. No solicitamos datos clínicos ni de pacientes, y te pedimos no compartirlos en comentarios.</p> },
  { id: "uso", title: "Para qué los usamos", body: <p>Para crear tu cuenta, permitirte descargar tus materiales, mostrar tus opiniones y comunicarnos contigo sobre tu cuenta. No los usamos para perfilarte ni los vendemos.</p> },
  { id: "marco", title: "Marco legal", body: <p>Tratamos tus datos conforme a la Ley N.º 29733, Ley de Protección de Datos Personales del Perú, y su reglamento. La información de salud es un dato sensible: por eso esta tienda no la recopila.</p> },
  { id: "terceros", title: "Con quién se comparten", body: <p>Usamos proveedores de infraestructura (Supabase, Vercel, Cloudflare Turnstile) que procesan datos únicamente para operar el sitio. Podría realizarse transferencia a servidores fuera del Perú con las garantías que exige la ley.</p> },
  { id: "menores", title: "Menores de edad", body: <p>El sitio es para personas mayores de 18 años. Si detectamos una cuenta de un menor, la eliminaremos.</p> },
  { id: "derechos", title: "Tus derechos", body: <p>Puedes solicitar acceso, rectificación, cancelación u oposición escribiéndonos al correo de contacto de la tienda. También puedes acudir a la Autoridad Nacional de Protección de Datos Personales.</p> },
  { id: "seguridad", title: "Seguridad", body: <p>Los archivos se entregan mediante enlaces temporales, las contraseñas se almacenan cifradas y usamos verificación de seguridad contra abusos.</p> },
  { id: "cookies", title: "Cookies", body: <p>Usamos únicamente las cookies necesarias para mantener tu sesión iniciada.</p> },
];

export default function Privacidad() {
  return <LegalLayout title="Política de privacidad" secs={secs} updated="noviembre de 2026" />;
}
