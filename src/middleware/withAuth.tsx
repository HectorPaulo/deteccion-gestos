import { useRouter } from "next/router";
import { useEffect } from "react";

export default function withAuth(Component: React.FC) {
  return function AuthenticatedComponent(props: React.ComponentProps<typeof Component>) {
    const router = useRouter();

    useEffect(() => {
      const passedPruebaVida = localStorage.getItem("passedPruebaVida");
      if (!passedPruebaVida) {
        router.push("/prueba-vida");
      }
    }, [router]);

    return <Component {...props} />;
  };
}