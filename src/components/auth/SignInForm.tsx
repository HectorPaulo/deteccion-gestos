"use client";
import { useRouter } from "next/navigation"; // Cambia esto
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
    onSubmit: (values) => {
      console.log("Datos del formulario:", values);
      // Simula autenticación exitosa
      setTimeout(() => {
        router.push("/prueba-vida"); // Redirige a PruebaVida
      }, 1000);
    },
  });

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
                  <Button type="submit" className="w-full" size="sm">
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
