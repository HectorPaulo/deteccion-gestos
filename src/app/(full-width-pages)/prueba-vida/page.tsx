"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { GESTURES } from "@/constants/gestures";
import { mediapipeService } from "@/services/mediapipeService";
import { FilesetResolver, FaceLandmarker, GestureRecognizer } from "@mediapipe/tasks-vision";

const PruebaVida = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gesture, setGesture] = useState(GESTURES[Math.floor(Math.random() * GESTURES.length)]);
  const [cumple, setCumple] = useState(false);
  const router = useRouter();
  const streamRef = useRef<MediaStream | null>(null);

  const cambiarGesto = () => {
    const nuevaLista = GESTURES.filter((g) => g.shape !== gesture.shape);
    setGesture(nuevaLista[Math.floor(Math.random() * nuevaLista.length)]);
    setCumple(false);
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
          streamRef.current = stream;
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

      // Verifica que el video tenga dimensiones válidas
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("El video no tiene dimensiones válidas.");
        requestAnimationFrame(loop);
        return;
      }

      try {
        console.log("Ejecutando bucle de detección...");
        if (gesture.tipo === "rostro") {
          try {
            console.log("Ejecutando detección de rostro...");
            const blendShapes = await mediapipeService.detectFace(video);
            console.log("Resultados de detección de rostro:", blendShapes);
            if (blendShapes) {
              const shape = blendShapes.find((s) => s.categoryName === gesture.shape);
              setCumple(!!(shape && "umbral" in gesture && typeof gesture.umbral === "number" && shape.score >= gesture.umbral));
            }
          } catch (error) {
            console.error("Error detectando rostro:", error);
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [gesture]);

  useEffect(() => {
    if (cumple) {
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  }, [cumple, router]);

  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks();
      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "CPU", // Cambia a CPU si GPU no funciona correctamente
        },
        outputFaceBlendshapes: true,
        runningMode: this.runningMode,
        numFaces: 1,
      });
    };

    initializeFaceLandmarker();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-blue-950 text-white">
      <div className="bg-white text-gray-800 rounded-4xl shadow-xl p-8 max-w-screen w-1/2">
        <h2 className="text-6xl font-semibold text-center mb-4">Prueba de Vida</h2>
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">{gesture.nombre}</h1>
        <div className="flex justify-center mb-6">
          <video ref={videoRef} autoPlay muted className="w-full max-w-md rounded-lg shadow-md border border-gray-300"></video>
        </div>
        <div className={`text-center text-lg font-semibold mb-6 ${cumple ? "text-green-600" : "text-red-600"}`}>
          {cumple ? "✅ Cumple" : "❌ No Cumple"}
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={cambiarGesto} className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600 transition">
            Cambiar gesto
          </button>
        </div>
      </div>
    </div>
  );
};

export default PruebaVida;