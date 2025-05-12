/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/firebaseConfig";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState, useCallback, useRef } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import Select from "@/components/form/Select";

const estadosMexico = [
  { value: "Aguascalientes", label: "Aguascalientes" },
  { value: "Baja California", label: "Baja California" },
  { value: "Baja California Sur", label: "Baja California Sur" },
  { value: "Campeche", label: "Campeche" },
  { value: "Chiapas", label: "Chiapas" },
  { value: "Chihuahua", label: "Chihuahua" },
  { value: "Ciudad de México", label: "Ciudad de México" },
  { value: "Coahuila", label: "Coahuila" },
  { value: "Colima", label: "Colima" },
  { value: "Durango", label: "Durango" },
  { value: "Estado de México", label: "Estado de México" },
  { value: "Guanajuato", label: "Guanajuato" },
  { value: "Guerrero", label: "Guerrero" },
  { value: "Hidalgo", label: "Hidalgo" },
  { value: "Jalisco", label: "Jalisco" },
  { value: "Michoacán", label: "Michoacán" },
  { value: "Morelos", label: "Morelos" },
  { value: "Nayarit", label: "Nayarit" },
  { value: "Nuevo León", label: "Nuevo León" },
  { value: "Oaxaca", label: "Oaxaca" },
  { value: "Puebla", label: "Puebla" },
  { value: "Querétaro", label: "Querétaro" },
  { value: "Quintana Roo", label: "Quintana Roo" },
  { value: "San Luis Potosí", label: "San Luis Potosí" },
  { value: "Sinaloa", label: "Sinaloa" },
  { value: "Sonora", label: "Sonora" },
  { value: "Tabasco", label: "Tabasco" },
  { value: "Tamaulipas", label: "Tamaulipas" },
  { value: "Tlaxcala", label: "Tlaxcala" },
  { value: "Veracruz", label: "Veracruz" },
  { value: "Yucatán", label: "Yucatán" },
  { value: "Zacatecas", label: "Zacatecas" },
];

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [username, setUsername] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [country, setCountry] = useState("México");
  const [state, setState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<unknown>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(0);
  const [cumple, setCumple] = useState(false);

  const detectGestures = useCallback((blendshapes: any[]) => {
    if (!blendshapes || blendshapes.length === 0) return false;

    const requiredGesture = blendshapes.find(
      (shape) => shape.categoryName === gesture.shape
    );

    return requiredGesture && requiredGesture.score > 0.5;
  }, []); // Elimina `gesture.shape` de las dependencias

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !faceLandmarkerRef.current || !videoRef.current.videoWidth) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    if (video.currentTime === lastVideoTimeRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }
    lastVideoTimeRef.current = video.currentTime;

    try {
      const results = await faceLandmarkerRef.current.detectForVideo(video, performance.now());

      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const blendshapes = results.faceBlendshapes[0].categories;
        setCumple(detectGestures(blendshapes));
      }
    } catch (err) {
      console.error("Error processing frame:", err);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [detectGestures]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar contraseñas
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Validar año de nacimiento
    const currentYear = new Date().getFullYear();
    if (Number(birthYear) < 1900 || Number(birthYear) > currentYear) {
      setError("El año de nacimiento no es válido.");
      return;
    }

    // Normalizar nombres y apellidos
    const normalizeText = (text: string) =>
      text.replace(/[^a-zA-Z\s]/g, "").trim();

    const normalizedUsername = username
      .replace(/[^a-zA-Z\s]/g, "")
      .trim()
      .split(" ")
      .slice(0, 2)
      .join(" ");

    setName(normalizeText(name));
    setLastName(normalizeText(lastName));
    setMiddleName(normalizeText(middleName));
    setUsername(normalizedUsername);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/prueba-vida");
    } catch (error) {
      setError("No se pudo registrar. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Regístrate
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tus datos para registrarte.
            </p>
          </div>
          <div>
            <form onSubmit={handleSignUp}>
              <div className="space-y-6">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Apellido Paterno</Label>
                    <Input
                      type="text"
                      placeholder="Tu apellido paterno"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Apellido Materno</Label>
                    <Input
                      type="text"
                      placeholder="Tu apellido materno"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Nombre de Usuario</Label>
                  <Input
                    type="text"
                    placeholder="Tu nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Año de Nacimiento</Label>
                  <Input
                    type="number"
                    placeholder="YYYY"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>País</Label>
                    <Select
                      options={[
                        { value: "México", label: "México" },
                        { value: "Otro", label: "Otro" },
                      ]}
                      defaultValue="México"
                      onChange={(value) => setCountry(value)}
                    />
                  </div>
                  {country === "México" && (
                    <div>
                      <Label>Estado</Label>
                      <Select
                        options={estadosMexico}
                        placeholder="Selecciona tu estado"
                        onChange={(value) => setState(value)}
                      />
                    </div>
                  )}
                </div>
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
                  <Label>Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-gray-500 dark:text-gray-400"
                    >
                      {showConfirmPassword ? <EyeIcon /> : <EyeCloseIcon />}
                    </span>
                  </div>
                </div>
                <div>
                  <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
                    Registrarse
                  </button>
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
                ¿Ya tienes una cuenta?{" "}
                <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
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