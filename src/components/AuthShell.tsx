import AccessCard from "./AccessCard";

export default function AuthShell({ initial, next }: { initial: "ingresar" | "registro"; next?: string }) {
  return (
    <div className="auth">
      <section className="auth-g" aria-label="Cómo funciona la tienda">
        <img src="/images/asistente.jpg" alt="Guía virtual de Materiales de Tatiana" />
        <h2>Materiales para terapia, listos para usar</h2>
        <div className="bubble">¡Hola! Soy tu guía. Te acompaño paso a paso por la tienda.</div>
        <ol>
          <li>① Elige entre 6 tipos de terapia</li>
          <li>② Obtén tu material y descárgalo</li>
          <li>③ Califica y comenta lo que usaste</li>
        </ol>
      </section>
      <div className="auth-f"><AccessCard initial={initial} next={next} /></div>
    </div>
  );
}
