import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <h4>Materiales de Tatiana</h4>
            <p style={{ margin: 0, maxWidth: 360 }}>Materiales digitales de psicología clínica y educativa para terapia, aula y hogar.</p>
          </div>
          <div>
            <h4>Tienda</h4>
            <Link href="/tienda">Todos los materiales</Link>
            <Link href="/tienda?area=clinica">Clínica</Link>
            <Link href="/tienda?area=educativa">Educativa</Link>
            <Link href="/tienda?gratis=1">Gratis</Link>
          </div>
          <div>
            <h4>Información</h4>
            <Link href="/#guia">Cómo funciona</Link>
            <Link href="/info/terminos">Términos y condiciones</Link>
            <Link href="/info/privacidad">Política de privacidad</Link>
          </div>
        </div>
        <p className="ftr-note">
          © {new Date().getFullYear()} Materiales de Tatiana. Los materiales son recursos de apoyo y no reemplazan la evaluación, el diagnóstico ni el tratamiento de un profesional. Si tú o alguien cercano está en crisis, comunícate con la Línea 113 del MINSA o con los servicios de emergencia.
        </p>
      </div>
    </footer>
  );
}
