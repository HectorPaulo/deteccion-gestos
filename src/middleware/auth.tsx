import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // Ejemplo: ["admin", "user"]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Simula obtener el rol del usuario desde un atributo personalizado
        const role = user.email === "admin@example.com" ? "admin" : "user";
        setUserRole(role);

        if (!allowedRoles.includes(role)) {
          router.push("/login"); // Redirige si no tiene acceso
        }
      } else {
        router.push("/login"); // Redirige si no está autenticado
      }
    });

    return () => unsubscribe();
  }, [allowedRoles, router]);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null; // Muestra nada mientras redirige
  }

  return <>{children}</>;
}