/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useCallback, useRef } from "react";

export const useFaceGestureDetection = (visionRef: React.MutableRefObject<any>, showMesh: boolean, gesture: any) => {
    const faceLandmarkerRef = useRef<any>(null);

    const initFaceGestureDetection = useCallback(async (wasmFileset: any) => {
        const { FaceLandmarker } = visionRef.current;
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(wasmFileset, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            outputFaceBlendshapes: true,
            numFaces: 1
        });
    }, [visionRef]);

    const detectFaceGestures = useCallback((faceBlendshapes: any[]) => {
        if (!gesture || gesture.tipo !== "rostro") return false;
        return faceBlendshapes?.[0]?.categories?.find(
            (shape: any) => shape.categoryName === gesture.shape && shape.score >= gesture.umbral
        );
    }, [gesture]);

    const drawFaceLandmarks = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, faceResults: any) => {
        if (!showMesh || !faceResults?.faceLandmarks) return;
        const drawingUtils = new visionRef.current.DrawingUtils(ctx);
        faceResults.faceLandmarks.forEach((landmarks: any) => {
            drawingUtils.drawConnectors(
                landmarks,
                visionRef.current.FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                { color: "#C0C0C070", lineWidth: 1 }
            );
            drawingUtils.drawConnectors(
                landmarks,
                visionRef.current.FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                { color: "#fff" }
            );
            drawingUtils.drawConnectors(
                landmarks,
                visionRef.current.FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                { color: "#fff" }
            );
            drawingUtils.drawConnectors(
                landmarks,
                visionRef.current.FaceLandmarker.FACE_LANDMARKS_LIPS,
                { color: "#E0E0E0" }
            );
        });
    }, [showMesh, visionRef]);

    return {
        faceLandmarkerRef,
        initFaceGestureDetection,
        detectFaceGestures,
        drawFaceLandmarks
    };
};