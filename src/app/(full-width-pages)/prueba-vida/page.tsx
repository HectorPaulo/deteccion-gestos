/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GESTURES } from "@/constants/gestures";
import { useHandGestureDetection } from "./GestureHandDetector/GestureHandDetector";
import { useFaceGestureDetection } from "./GestureFaceDetector/GestureFaceDetector";

const PruebaVida = ({ onSuccess }: { onSuccess: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState(GESTURES[0]);
  const [cumple, setCumple] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMesh, setShowMesh] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const animationFrameRef = useRef<number>(0);
  const detectionStartTimeRef = useRef<number | null>(null);
  const visionRef = useRef<any>(null);

  const {
    gestureRecognizerRef,
    initHandGestureDetection,
    detectHandGestures,
    drawHandLandmarks
  } = useHandGestureDetection(visionRef, showMesh, gesture);

  const {
    faceLandmarkerRef,
    initFaceGestureDetection,
    detectFaceGestures,
    drawFaceLandmarks
  } = useFaceGestureDetection(visionRef, showMesh, gesture);

  useEffect(() => {
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // Ignorar errores específicos de WASM/Mediapipe
      if (typeof message === 'string' && message.includes('vision_wasm_internal')) {
        return true; // Evita que el error se propague
      }
      if (originalOnError) {
        return originalOnError.apply(this, arguments);
      }
    };

    return() => {
      window.onerror = originalOnError;
    };
  }, []);

  useEffect(() => {
    setGesture(GESTURES[Math.floor(Math.random() * GESTURES.length)]);
  }, []);

  const cambiarGesto = () => {
    const nuevaLista = GESTURES.filter((g) => g.shape !== gesture.shape);
    setGesture(nuevaLista[Math.floor(Math.random() * nuevaLista.length)]);
    setCumple(false);
    detectionStartTimeRef.current = null;
  };

  const processFrame = useCallback(async () => {
    try {

      if (!videoRef.current || !videoRef.current.videoWidth) {
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
      const startTimeMs = performance.now();
      let faceResults, gestureResults;

      if ((gesture.tipo === "rostro" || gesture.tipo === "combinado") && faceLandmarkerRef.current) {
        try {
          faceResults = await faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
        } catch (faceError) {
          console.error("Error en detección facial:", faceError);
        }
      }

      if ((gesture.tipo === "mano" || gesture.tipo === "combinado") && gestureRecognizerRef.current) {
        try {
          gestureResults = await gestureRecognizerRef.current.recognizeForVideo(video, startTimeMs);
        } catch (handError) {
          console.error("Error en detección de gestos:", handError);
        }
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (showMesh) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          drawFaceLandmarks(ctx, canvas, faceResults);
          drawHandLandmarks(ctx, canvas, gestureResults);
        }
      }

      const faceBlendshapes = faceResults?.faceBlendshapes || [];
      const cumpleGesto = gesture.tipo === "rostro"
        ? detectFaceGestures(faceBlendshapes)
        : gesture.tipo === "mano"
          ? detectHandGestures(gestureResults || {})
          : false;
          
      if (cumpleGesto) {
        if (!detectionStartTimeRef.current) {
          detectionStartTimeRef.current = performance.now();
        } else if (performance.now() - detectionStartTimeRef.current >= 500) {
          setCumple(true);
          onSuccess();
        }
      } else {
        detectionStartTimeRef.current = null;
        setCumple(false);
      }
    } catch (err) {
      console.error("Error en processFrame:", err);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  } catch (err) {
    if (!err.message.includes('vision_wasm_internal')) {
      console.error('Error importante: ', err);
    }
  } finally {
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }
  }, [
    showMesh,
    onSuccess,
    gesture?.tipo,
    drawFaceLandmarks,
    drawHandLandmarks,
    detectFaceGestures,
    detectHandGestures
  ]);

  useEffect(() => {
    let originalConsoleError: (...data: any[]) => void;
    let isMounted = true;

    const initMediaPipe = async () => {
      try {
        originalConsoleError = console.error;
        console.error = (...args) => {
          if (args.some(args => arg.include('vision_wasm_internal'))) {
            return;
          }
          originalConsoleError.apply(console, args);
        };
        
        setLoading(true);
        setError(null);

        const vision = await import("@mediapipe/tasks-vision");
        visionRef.current = vision;
        const { FilesetResolver } = vision;

        const wasmFileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
          {
            locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm/${file}`;
            }
          }
        );

        await initFaceGestureDetection(wasmFileset);
        await initHandGestureDetection(wasmFileset);

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al inicializar MediaPipe:", err);
        if (isMounted) {
          setError(`Error al cargar los modelos: ${err.message}`);
          setLoading(false);
        }
      } finally {
        console.error = originalConsoleError;
        setLoading(false);
      }
    };

    initMediaPipe();

    return () => {
      isMounted = false;
    };
  }, [initFaceGestureDetection, initHandGestureDetection]);

  useEffect(() => {
    let isMounted = true;

    const initCamera = async () => {
      if (loading || error || !isMounted) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;

        if (video) {
          video.srcObject = stream;

          await new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => resolve();
            video.onerror = () => reject(new Error("Error al cargar el video"));
          });

          if (canvasRef.current) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }

          await video.play().catch(err => {
            throw new Error(`No se pudo reproducir el video: ${err.message}`);
          });

          setTimeout(() => {
            if (isMounted) {
              animationFrameRef.current = requestAnimationFrame(processFrame);
            }
          }, 500);
        }
      } catch (err) {
        console.error("Error al iniciar cámara:", err);
        if (isMounted) {
          setError(`Error al acceder a la cámara: ${err.message}`);
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [loading, error, processFrame]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg dark:text-white">Cargando modelos de detección...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-red-100 dark:bg-red-900 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-4xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white text-gray-900 mb-2">
            {gesture?.nombre || "Realiza el gesto solicitado"}
          </h1>
          <div className={`text-lg font-semibold ${cumple ? "text-green-600" : "text-red-600"}`}>
            {cumple ? "✅ Gesto detectado correctamente" : "❌ Realiza el gesto solicitado"}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-6">
          <div className="relative w-full max-w-md">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-xl border-2 border-gray-300"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={cambiarGesto}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            disabled={cumple}
          >
            Cambiar gesto
          </button>
          <button
            onClick={() => setShowMesh(prev => !prev)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
          >
            {showMesh ? "Ocultar Mallado" : "Mostrar Mallado"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PruebaVida;