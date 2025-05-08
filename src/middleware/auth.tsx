import { useRouter } from "next/router";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Ejemplo: ["admin", "user"]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null; // Simula obtener el rol del usuario

  useEffect(() => {
    if (!userRole || !allowedRoles.includes(userRole)) {
      router.push("/login"); // Redirige al login si no tiene acceso
    }
  }, [userRole, allowedRoles, router]);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null; // Muestra nada mientras redirige
  }

  return <>{children}</>;
}