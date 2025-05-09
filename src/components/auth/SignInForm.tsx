"use client";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

export interface InputProps {
  placeholder?: string;
  type?: string;
  id?: string;
  name?: string;
  value?: string; // Added value property
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Validaciones con Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Debe ser un correo válido")
      .required("El correo es obligatorio"),
    password: Yup.string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .required("La contraseña es obligatoria"),
  });

  // Formik para manejar el formulario
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError("");
      
      try {
        console.log("Enviando datos:", values);
        
        // Realizar petición POST al endpoint especificado
        const response = await fetch("http://localhost:3008/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error en la autenticación");
        }

        // Procesar respuesta exitosa
        const data = await response.json();
        console.log("Respuesta del servidor:", data);
        
        // Guardar datos en localStorage
        localStorage.setItem("login", JSON.stringify(true));
        localStorage.setItem("isAdmin", JSON.stringify(data.isAdmin || false));
        localStorage.setItem("userId", data.userId || "");
        
        console.log("Datos guardados en localStorage");
        
        // Redirección a la página de prueba de vida
        router.push("/prueba-vida");
        
      } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        setError(error instanceof Error ? error.message : "Error en la autenticación");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Volver al panel
        </Link>
      </div>
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
            {error && (
              <div className="p-3 mb-4 text-sm text-white bg-error-500 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={formik.handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Correo Electrónico <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@mail.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-error-500">
                      {formik.errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      id="password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-error-500">
                      {formik.errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿No tienes una cuenta? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
