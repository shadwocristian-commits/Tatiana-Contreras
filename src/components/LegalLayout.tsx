export type Sec = { id: string; title: string; body: React.ReactNode };

export default function LegalLayout({ title, secs, updated }: { title: string; secs: Sec[]; updated: string }) {
  return (
    <div className="wrap">
      <h1 className="legal-t">{title}</h1>
      <div className="legal-w">
        <nav className="toc" aria-label="Contenido">
          <h2>Contenido</h2>
          {secs.map((s, i) => <a key={s.id} href={`#${s.id}`}>{i + 1}. {s.title}</a>)}
        </nav>
        <article className="legal-b">
          <p className="warn">Aviso importante: los materiales son recursos de apoyo. No reemplazan la evaluación, el diagnóstico ni el tratamiento de un profesional. Este sitio no es un servicio de emergencia: ante una crisis, llama a la Línea 113 del MINSA o a emergencias.</p>
          {secs.map((s, i) => (
            <section key={s.id}>
              <h2 id={s.id}>{i + 1}. {s.title}</h2>
              {s.body}
            </section>
          ))}
          <p className="draft">Última actualización: {updated}. Borrador de trabajo: debe revisarlo un abogado antes de la publicación definitiva.</p>
        </article>
      </div>
    </div>
  );
}
