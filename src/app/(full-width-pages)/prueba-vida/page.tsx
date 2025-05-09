"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { GESTURES } from "@/constants/gestures";
import { mediapipeService } from "@/services/mediapipeService";

const PruebaVida = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState(GESTURES[Math.floor(Math.random() * GESTURES.length)]);
  const [cumple, setCumple] = useState(false);
  const router = useRouter();
  const streamRef = useRef<MediaStream | null>(null); // Referencia para el flujo de medios

  const cambiarGesto = () => {
    const nuevaLista = GESTURES.filter((g) => g.shape !== gesture.shape);
    setGesture(nuevaLista[Math.floor(Math.random() * nuevaLista.length)]);
    setCumple(false); // Reinicia el estado
  };

  useEffect(() => {
    const init = async () => {
      try {
        await mediapipeService.init();
        const video = videoRef.current;
        if (video) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream; // Guarda el flujo de medios
          video.srcObject = stream;
          video.onloadeddata = () => {
            video.play();
            loop();
          };
        }
      } catch (error) {
        console.error("Error inicializando Mediapipe o el video:", error);
      }
    };

    const loop = async () => {
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

    init();

    return () => {
      // Detén el flujo de medios al desmontar el componente
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [gesture]);

  // Redirige automáticamente cuando cumple sea true
  useEffect(() => {
    if (cumple) {
      setTimeout(() => {
        router.push("/");
      }, 1000); // Espera 1 segundo antes de redirigir
    }
  }, [cumple, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-center mb-4">Prueba de Vida</h2>
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">{gesture.nombre}</h1>

        <div className="flex justify-center mb-6">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full max-w-md rounded-lg shadow-md border border-gray-300"
          ></video>
        </div>

        <div
          className={`text-center text-lg font-semibold mb-6 ${
            cumple ? "text-green-600" : "text-red-600"
          }`}
        >
          {cumple ? "✅ Cumple" : "❌ No Cumple"}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={cambiarGesto}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Cambiar gesto
          </button>
        </div>
      </div>
    </div>
  );
};

export default PruebaVida;