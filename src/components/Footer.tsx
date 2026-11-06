import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <h3>Materiales de Tatiana</h3>
            <p style={{ margin: 0, maxWidth: 360 }}>Materiales digitales para terapia clínica y educativa: fichas, tarjetas y guías listas para descargar e imprimir.</p>
          </div>
          <div>
            <h3>Tienda</h3>
            <Link href="/tienda">Todos los materiales</Link>
            <Link href="/tienda?area=clinica">Clínica</Link>
            <Link href="/tienda?area=educativa">Educativa</Link>
            <Link href="/tienda?gratis=1">Gratis</Link>
          </div>
          <div>
            <h3>Información</h3>
            <Link href="/#guia">Cómo funciona</Link>
            <Link href="/info/terminos">Términos y condiciones</Link>
            <Link href="/info/privacidad">Política de privacidad</Link>
          </div>
        </div>
        <p className="aviso">
          © {new Date().getFullYear()} Materiales de Tatiana. Los materiales son recursos de apoyo y no reemplazan la evaluación, el diagnóstico ni el tratamiento de un profesional. Si estás en una crisis, llama a la Línea 113 (MINSA) o a emergencias.
        </p>
      </div>
    </footer>
  );
}
