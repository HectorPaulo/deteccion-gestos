import {
  FaceLandmarker,
  GestureRecognizer,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export class MediapipeService {
  private faceLandmarker: FaceLandmarker | null = null;
  private gestureRecognizer: GestureRecognizer | null = null;
  private runningMode: "IMAGE" | "VIDEO" = "VIDEO";

  async init() {
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: this.runningMode,
        numFaces: 1,
      });

      this.gestureRecognizer = await GestureRecognizer.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU",
        },
        runningMode: this.runningMode,
      });

      console.log("Mediapipe inicializado correctamente.");
    } catch (error) {
      console.error("Error inicializando Mediapipe:", error);
    }
  }

  async detectFace(video: HTMLVideoElement) {
    try {
      if (!this.faceLandmarker) {
        console.error("FaceLandmarker no está inicializado.");
        return null;
      }
      const results = await this.faceLandmarker.detectForVideo(video, performance.now());
      return results?.faceBlendshapes?.[0]?.categories || [];
    } catch (error) {
      console.error("Error detectando rostro:", error);
      return null;
    }
  }

  async detectGesture(video: HTMLVideoElement) {
    try {
      if (!this.gestureRecognizer) {
        console.error("GestureRecognizer no está inicializado.");
        return null;
      }
      const results = await this.gestureRecognizer.recognizeForVideo(video, performance.now());
      return results?.gestures?.[0]?.[0]?.categoryName || "";
    } catch (error) {
      console.error("Error detectando gesto:", error);
      return null;
    }
  }
}

export const mediapipeService = new MediapipeService();