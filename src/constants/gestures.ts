export const FACE_GESTURES = [
  { tipo: "rostro", nombre: "Sonríe", shape: "mouthSmileLeft", umbral: 0.4 },
  { tipo: "rostro", nombre: "Levanta las cejas", shape: "browOuterUpLeft", umbral: 0.5 },
  { tipo: "rostro", nombre: "Frunce el ceño", shape: "browDownLeft", umbral: 0.5 },
  { tipo: "rostro", nombre: "Cierra el ojo izquierdo", shape: "eyeBlinkLeft", umbral: 0.5 },
  { tipo: "rostro", nombre: "Cierra el ojo derecho", shape: "eyeBlinkRight", umbral: 0.5 },
  { tipo: "rostro", nombre: "Abre la boca", shape: "jawOpen", umbral: 0.5 },
];

export const HAND_GESTURES = [
  { tipo: "mano", nombre: "Haz un pulgar arriba", shape: "Thumb_Up" },
  { tipo: "mano", nombre: "Haz la seña de victoria", shape: "Victory" },
  { tipo: "mano", nombre: "Haz la palma abierta", shape: "Open_Palm" },
  { tipo: "mano", nombre: "Haz el signo del rock 🤟", shape: "ILoveYou" },
];

export const GESTURES = [...FACE_GESTURES, ...HAND_GESTURES];