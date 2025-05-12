/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useCallback, useRef } from "react";

export const useHandGestureDetection = (visionRef: React.MutableRefObject<any>, showMesh: boolean, gesture: any) => {
    const gestureRecognizerRef = useRef<any>(null);

    const initHandGestureDetection = useCallback(async (wasmFileset: any) => {
        const { GestureRecognizer } = visionRef.current;
        gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(wasmFileset, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });
    }, [visionRef]);

    const detectHandGestures = useCallback((gestureResults: any) => {
        if (!gesture || gesture.tipo !== "mano") return false;
        return gestureResults?.gestures?.some(
            (gestureList: any[]) =>
                gestureList.some((g: any) => g.categoryName === gesture.shape)
        );
    }, [gesture]);

    const drawHandLandmarks = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gestureResults: any) => {
        if (!showMesh || !gestureResults?.landmarks) return;
        const drawingUtils = new visionRef.current.DrawingUtils(ctx);
        gestureResults.landmarks.forEach((landmarks: any) => {
            drawingUtils.drawConnectors(
                landmarks,
                visionRef.current.GestureRecognizer.HAND_CONNECTIONS,
                { color: "#00FF00", lineWidth: 5 }
            );
            drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
        });
    }, [showMesh, visionRef]);

    return {
        gestureRecognizerRef,
        initHandGestureDetection,
        detectHandGestures,
        drawHandLandmarks
    };
};