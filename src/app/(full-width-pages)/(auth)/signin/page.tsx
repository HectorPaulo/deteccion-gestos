import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio de sesión | LUDWIG-ASUS",
  description: "Inicia sesión con tu cuenta para entrar a la aplicación.",
};

export default function SignIn() {
  return <SignInForm />;
}
