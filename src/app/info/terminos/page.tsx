import LegalLayout, { type Sec } from "@/components/LegalLayout";

export const metadata = { title: "Términos y condiciones" };

const secs: Sec[] = [
  { id: "quienes", title: "Quiénes somos", body: <p>“Materiales de Tatiana” es una tienda de materiales digitales para terapia clínica y educativa, elaborados por la psicóloga Tatiana Contreras Jacovi. Al usar el sitio aceptas estos términos.</p> },
  { id: "naturaleza", title: "Naturaleza de los materiales", body: <p>Son herramientas de apoyo para terapia, aula y hogar (fichas, tarjetas, guías). No constituyen un servicio de salud ni sustituyen la evaluación, el diagnóstico o el tratamiento de un profesional habilitado.</p> },
  { id: "etico", title: "Uso profesional y ético", body: <p>Quien use los materiales con fines clínicos responde por su formación y por el código de ética de su profesión (en el Perú, el Colegio de Psicólogos del Perú). Está prohibido usarlos para diagnosticar sin habilitación profesional, etiquetar, estigmatizar o discriminar a las personas.</p> },
  { id: "menores", title: "Menores de edad", body: <p>Las cuentas son para mayores de 18 años. Los materiales dirigidos a niñas, niños y adolescentes deben usarse siempre con acompañamiento de una persona adulta responsable o de un profesional.</p> },
  { id: "cuenta", title: "Cuenta de usuario", body: <p>Debes registrarte con datos verdaderos y cuidar tu contraseña. Eres responsable de la actividad de tu cuenta. Podemos suspenderla ante usos que incumplan estos términos.</p> },
  { id: "licencia", title: "Licencia y autoría", body: <p>Cada material se licencia para tu uso personal o profesional propio (consulta, aula, talleres). Está prohibido revender, redistribuir, compartir públicamente, subir a otras plataformas o retirar la autoría. Los derechos de autor pertenecen a su autora (Decreto Legislativo 822).</p> },
  { id: "confidencialidad", title: "Confidencialidad", body: <p>No publiques datos de pacientes ni información de salud de terceros en opiniones o comentarios; serán eliminados. Esta tienda no solicita ni almacena datos clínicos.</p> },
  { id: "precios", title: "Precios y reembolsos", body: <p>Por ahora los materiales se ofrecen sin costo. Cuando se activen los pagos, los precios se mostrarán en soles (S/) antes de confirmar. Al ser productos digitales de descarga inmediata, no hay reembolso tras la descarga, salvo archivo dañado o distinto al descrito (Ley 29571, Código de Protección y Defensa del Consumidor).</p> },
  { id: "opiniones", title: "Opiniones", body: <p>Solo quienes obtuvieron un material pueden opinar. Moderamos comentarios ofensivos, discriminatorios o que incluyan datos personales o clínicos.</p> },
  { id: "responsabilidad", title: "Responsabilidad", body: <p>Los materiales se entregan como recurso de apoyo. No respondemos por el uso inadecuado ni por decisiones clínicas o educativas tomadas a partir de ellos.</p> },
  { id: "reclamos", title: "Reclamos y cambios", body: <p>Puedes escribirnos para cualquier reclamo y lo atenderemos a la brevedad. Podemos actualizar estos términos; la versión vigente estará siempre en esta página.</p> },
];

export default function Terminos() {
  return <LegalLayout title="Términos y condiciones" secs={secs} updated="noviembre de 2026" />;
}
