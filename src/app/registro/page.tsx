import AccessCard from "@/components/AccessCard";
import AuthShell from "@/components/AuthShell";

export const metadata = { title: "Crear cuenta" };

export default function Registro() {
  return (
    <AuthShell>
      <AccessCard initial="registro" />
    </AuthShell>
  );
}
