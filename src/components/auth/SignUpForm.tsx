"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { useFormik } from "formik";
import * as Yup from "yup";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter(); // Use useRouter here

  // Validaciones con Yup
  const validationSchema = Yup.object({
    fname: Yup.string().required("El nombre es obligatorio"),
    lname: Yup.string().required("El apellido es obligatorio"),
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
      fname: "",
      lname: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Datos del formulario:", values);
      // Simula registro exitoso
      setTimeout(() => {
        router.push("/prueba-vida"); // Redirige a PruebaVida
      }, 1000);
    },
  });

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
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
              Regístrate
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu correo electrónico y contraseña para registrarte.
            </p>
          </div>
          <div>
            <form onSubmit={formik.handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Nombre */}
                  <div className="sm:col-span-1">
                    <Label>
                      Nombre<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Ingresa tu nombre"
                      value={formik.values.fname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.fname && formik.errors.fname && (
                      <p className="text-sm text-error-500">
                        {formik.errors.fname}
                      </p>
                    )}
                  </div>
                  {/* Apellido */}
                  <div className="sm:col-span-1">
                    <Label>
                      Apellido<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Ingresa tu apellido"
                      value={formik.values.lname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.lname && formik.errors.lname && (
                      <p className="text-sm text-error-500">
                        {formik.errors.lname}
                      </p>
                    )}
                  </div>
                </div>
                {/* Correo Electrónico */}
                <div>
                  <Label>
                    Correo Electrónico<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Ingresa tu correo electrónico"
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
                {/* Contraseña */}
                <div>
                  <Label>
                    Contraseña<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Ingresa tu contraseña"
                      type={showPassword ? "text" : "password"}
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
                {/* Botón */}
                <div>
                  <button
                    type="submit"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  >
                    Registrarse
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Ya tienes una cuenta?
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
