/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { GESTURES } from "@/constants/gestures";

const PruebaVida = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const [gesture, setGesture] = useState(GESTURES[Math.floor(Math.random() * GESTURES.length)]);
  const [cumple, setCumple] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const streamRef = useRef<MediaStream | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const animationFrameRef = useRef<number>(0);

  const cambiarGesto = () => {
    const nuevaLista = GESTURES.filter((g) => g.shape !== gesture.shape);
    setGesture(nuevaLista[Math.floor(Math.random() * nuevaLista.length)]);
    setCumple(false);
  };

  const detectGestures = (blendshapes: any[]) => {
    if (!blendshapes || blendshapes.length === 0) return false;

    const requiredGesture = blendshapes.find(
      (shape) => shape.categoryName === gesture.shape
    );

    return requiredGesture && requiredGesture.score > 0.5;
  };

  const processFrame = async () => {
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
  };

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        setLoading(true);

        // Importación dinámica para evitar problemas con SSR
        const vision = await import("@mediapipe/tasks-vision");
        const { FilesetResolver, FaceLandmarker } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "CPU"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
          }
        );

        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize MediaPipe:", err);
        setError("Failed to load face detection model");
        setLoading(false);
      }
    };

    initMediaPipe();
  }, []);

  useEffect(() => {
    const initCamera = async () => {
      if (loading || error) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        streamRef.current = stream;
        const video = videoRef.current;

        if (video) {
          video.srcObject = stream;
          await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
          });

          if (canvasRef.current) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }

          video.play();
          animationFrameRef.current = requestAnimationFrame(processFrame);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera");
      }
    };

    initCamera();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [loading, error, processFrame]);

  useEffect(() => {
    if (cumple) {
      const timer = setTimeout(() => router.push("/"), 1000);
      return () => clearTimeout(timer);
    }
  }, [cumple, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading face detection model...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-blue-950 text-white">
      <div className="bg-white text-gray-800 rounded-4xl shadow-xl p-8 max-w-screen w-1/2">
        <h2 className="text-6xl font-semibold text-center mb-4">Prueba de Vida</h2>
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">{gesture.nombre}</h1>

        <div className="flex justify-center mb-6 relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full max-w-md rounded-lg shadow-md border border-gray-300"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full max-w-md pointer-events-none"
          />
        </div>

        <div className={`text-center text-lg font-semibold mb-6 ${cumple ? "text-green-600" : "text-red-600"}`}>
          {cumple ? "✅ Cumple" : "❌ No Cumple"}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={cambiarGesto}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-600 transition"
          >
            Cambiar gesto
          </button>
        </div>
      </div>
    </div>
  );
};

export default PruebaVida;