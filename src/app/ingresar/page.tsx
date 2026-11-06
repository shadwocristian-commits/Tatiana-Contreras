import AuthShell from "@/components/AuthShell";
import { safeNext } from "@/lib/safe";

export const metadata = { title: "Ingresar" };

export default async function Ingresar({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safe = safeNext(next);
  return <AuthShell initial="ingresar" next={safe} />;
}
