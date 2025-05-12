/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import PruebaVida from "@/app/(full-width-pages)/prueba-vida/page"; // Importa el componente

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
  const [captchaStep, setCaptchaStep] = useState(1); // Estado para el progreso del captcha
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email === "admin@example.com") {
        router.push("/admin");
      } else {
        setShowModal(true); // Muestra el modal al iniciar sesión
      }
    } catch (error) {
      setError("Credenciales inválidas. Inténtalo de nuevo.");
    }
  };

  const closeModal = async () => {
    setShowModal(false); // Cierra el modal
    await signOut(auth); // Cierra la sesión del usuario
    setError("La sesión ha sido cerrada porque no completaste la prueba.");
  };

  const handleCaptchaSuccess = () => {
    if (captchaStep < 3) {
      setCaptchaStep(captchaStep + 1); // Avanza al siguiente paso del captcha
    } else {
      setShowModal(false); // Cierra el modal al completar la prueba
      router.push("/"); // Redirige al sistema
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu correo electrónico y contraseña para iniciar sesión
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>Correo Electrónico</Label>
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contraseña</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 dark:text-gray-400"
                    >
                      {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                    </span>
                  </div>
                </div>
                <div>
                  <Button type="submit" className="w-full">
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            </form>
            {error && (
              <div className="mt-4 text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="mt-5">
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                ¿No tienes una cuenta?{" "}
                <Link href="/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/50">
          <div className="dark:bg-gray-800 rounded-lg shadow-lg shadow-gray-800 w-full max-w-3xl p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-3xl hover:scale-105 text-white hover:text-red-700"
            >
              ✕
            </button>
            <div className="text-center mb-4">
              <p className="text-lg font-semibold dark:text-white">Prueba de Vida ({captchaStep}/3)</p>
            </div>
            <PruebaVida onSuccess={handleCaptchaSuccess} /> {/* Pasa la función de éxito */}
          </div>
        </div>
      )}
    </div>
  );
}
