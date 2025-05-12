import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro | LUDWIG-ASUS",
  description: "Registra una cuenta para acceder a toda la experiencia.",
};

export default function SignUp() {
  return <SignUpForm />;
}
