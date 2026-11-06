export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrap auth">
      <aside className="auth-side">
        <img className="auth-doll" src="/images/asistente.jpg" alt="Guía virtual" />
        <h2>Materiales para terapia, listos para usar</h2>
        <div className="bubble">¡Hola! Soy tu guía. Con tu cuenta descargas y vuelves a descargar tus materiales cuando quieras.</div>
        <ul>
          <li><b>1</b><span>Elige entre 6 tipos de terapia.</span></li>
          <li><b>2</b><span>Obtén tu material y descárgalo al instante.</span></li>
          <li><b>3</b><span>Califica y comenta lo que usaste.</span></li>
        </ul>
      </aside>
      {children}
    </div>
  );
}
