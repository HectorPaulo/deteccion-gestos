"use client";

import React, { useEffect, useRef, useState } from "react";
import { GESTURES } from "@/constants/gestures";
import { mediapipeService } from "@/services/mediapipeService";

interface PruebaVidaProps {
  onEnviarDatos: (imagen: Blob, gesto: string, cumple: boolean) => void;
}

export default function PruebaVida({ onEnviarDatos }: PruebaVidaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState(GESTURES[Math.floor(Math.random() * GESTURES.length)]);
  const [cumple, setCumple] = useState(false);

  const cambiarGesto = () => {
    const nuevaLista = GESTURES.filter((g) => g.shape !== gesture.shape);
    setGesture(nuevaLista[Math.floor(Math.random() * nuevaLista.length)]);
    setCumple(false);
  };

  const enviarDatos = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        onEnviarDatos(blob, gesture.nombre, cumple);
      } else {
        alert("Error al generar la imagen.");
      }
    }, "image/jpeg");
  };

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Inicializando Mediapipe...");
        await mediapipeService.init();
        console.log("Mediapipe inicializado correctamente.");
        const video = videoRef.current;
        if (video) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          video.onloadeddata = () => {
            if (video.videoWidth === 0 || video.videoHeight === 0) {
              console.error("El video no tiene dimensiones válidas.");
              return;
            }
            console.log("Video cargado y listo.");
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

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("El video no tiene dimensiones válidas.");
        requestAnimationFrame(loop);
        return;
      }

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
      const video = videoRef.current;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [gesture]);

  return (
    <div className="flex flex-col items-center h-full">
      <h2 className="text-2xl font-semibold mb-4">Prueba de Vida</h2>
      <h1 className="text-4xl font-bold text-indigo-600 mb-6">{gesture.nombre}</h1>
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-3/4 rounded-lg shadow-md mb-4 object-cover"
      ></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="flex flex-col gap-4">
        <button
          onClick={cambiarGesto}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
        >
          Cambiar gesto
        </button>
        <button
          onClick={enviarDatos}
          className="bg-green-500 text-white px-4 py-2 rounded-xl shadow-xl hover:bg-green-600 transition"
        >
          Enviar datos
        </button>
      </div>
    </div>
  );
}