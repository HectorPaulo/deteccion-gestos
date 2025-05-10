import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio de sesión",
  description: "Inicia sesión con tu cuenta | LUDWIG-ASUS",
};

export default function SignIn() {
  return <SignInForm />;
}
