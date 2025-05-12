// filepath: /home/paulo/Documentos/deteccion-gestos/src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCSY0S3L-Qf16YYXrqU1Vzqh4uGPLItMfk",
  authDomain: "panel-gestos.firebaseapp.com",
  projectId: "panel-gestos",
  storageBucket: "panel-gestos.appspot.com",
  messagingSenderId: "393771556540",
  appId: "1:393771556540:web:b33f01b176abb861523ab9",
  measurementId: "G-RY0G0P0Q40",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);