import Link from "next/link";
import { Icon } from "./Icons";

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
            <Link href="/tienda"><Icon n="grid_view" />Todos los materiales</Link>
            <Link href="/tienda?area=clinica"><Icon n="psychology" />Clínica</Link>
            <Link href="/tienda?area=educativa"><Icon n="school" />Educativa</Link>
            <Link href="/tienda?gratis=1"><Icon n="redeem" />Gratis</Link>
          </div>
          <div>
            <h3>Información</h3>
            <Link href="/#guia"><Icon n="help" />Cómo funciona</Link>
            <Link href="/info/terminos"><Icon n="gavel" />Términos y condiciones</Link>
            <Link href="/info/privacidad"><Icon n="lock" />Política de privacidad</Link>
            <Link href="/libro-de-reclamaciones"><Icon n="menu_book" />Libro de Reclamaciones</Link>
          </div>
        </div>
        <p className="aviso">
          © {new Date().getFullYear()} Materiales de Tatiana. Los materiales son recursos de apoyo y no reemplazan la evaluación, el diagnóstico ni el tratamiento de un profesional. Si estás en una crisis, llama a la Línea 113 (MINSA) o a emergencias.
        </p>
      </div>
    </footer>
  );
}
