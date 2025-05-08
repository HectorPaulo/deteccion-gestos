"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { GESTURES } from "@/constants/gestures";
import { mediapipeService } from "@/services/mediapipeService";

const PruebaVida = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState(null);
  const [cumple, setCumple] = useState(false);
  const router = useRouter();
  const isRunning = useRef(false); // Flag para controlar el bucle

  useEffect(() => {
    setGesture(GESTURES[Math.floor(Math.random() * GESTURES.length)]);
  }, []);

  const cambiarGesto = () => {
    if (!gesture) return;
    isRunning.current = false; // Detén el bucle antes de cambiar el gesto
    const nuevaLista = GESTURES.filter((g) => g.shape !== gesture.shape);
    setGesture(nuevaLista[Math.floor(Math.random() * nuevaLista.length)]);
    setCumple(false);
    isRunning.current = true; // Reactiva el bucle después de cambiar el gesto
  };

  useEffect(() => {
    const loop = async () => {
      if (!isRunning.current) return; // Detén el bucle si no está activo
      const video = videoRef.current;
      if (!video || !gesture) return;

      try {
        if (gesture.tipo === "rostro") {
          const blendShapes = await mediapipeService.detectFace(video);
          if (blendShapes) {
            const shape = blendShapes.find((s) => s.categoryName === gesture.shape);
            setCumple(!!(shape && "umbral" in gesture && typeof gesture.umbral === "number" && shape.score >= gesture.umbral));
          }
        } else {
          const detectedGesture = await mediapipeService.detectGesture(video);
          setCumple(detectedGesture === gesture.shape);
        }
      } catch (error) {
        console.error("Error en el bucle de detección:", error);
      }

      requestAnimationFrame(loop);
    };

    const init = async () => {
      try {
        await mediapipeService.init();
        const video = videoRef.current;
        if (video) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          video.onloadeddata = () => {
            video.play();
            isRunning.current = true; // Activa el bucle
            loop();
          };
        }
      } catch (error) {
        console.error("Error inicializando Mediapipe o el video:", error);
      }
    };

    init();

    return () => {
      isRunning.current = false; // Detén el bucle al desmontar el componente
    };
  }, [gesture]);

  const handleContinue = () => {
    localStorage.setItem("passedPruebaVida", "true");
    router.push("/");
  };

  if (!gesture) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="align-center p-4 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-2">Haz el gesto:</h2>
      <h1 className="text-3xl font-bold text-center mb-4">{gesture.nombre}</h1>

      <video ref={videoRef} autoPlay muted className="w-300 rounded shadow-md mb-4"></video>

      <div className={`text-2xl font-semibold mb-4 ${cumple ? "text-green-600" : "text-red-600"}`}>
        {cumple ? "✅ Cumple" : "❌ No Cumple"}
      </div>

      <button
        onClick={cambiarGesto}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
      >
        Cambiar gesto
      </button>

      {cumple && (
        <button
          onClick={handleContinue}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition mt-4"
        >
          Continuar al Dashboard
        </button>
      )}
    </div>
  );
};

export default PruebaVida;