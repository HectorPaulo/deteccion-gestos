"use client";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function withAuth(Component: React.FC) {
  return function AuthenticatedComponent(props: React.ComponentProps<typeof Component>) {
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(!user){
          router.push("/signin");
        }
      });
      return ()=> unsubscribe();
    }, [router]);

    return <Component {...props} />;
  };
}