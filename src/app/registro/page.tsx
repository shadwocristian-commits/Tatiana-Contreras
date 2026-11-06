import AccessCard from "@/components/AccessCard";

export const metadata = { title: "Crear cuenta" };

export default function Registro() {
  return (
    <div className="wrap" style={{ display: "flex", justifyContent: "center", padding: "56px 28px" }}>
      <AccessCard initial="registro" />
    </div>
  );
}
