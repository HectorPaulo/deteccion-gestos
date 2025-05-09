"use client";

import React, { useState } from "react";
import PruebaVida from "../prueba-vida/PruebaVida";

interface PruebaVidaModalProps {
  onClose: () => void;
}

export default function PruebaVidaModal({ onClose }: PruebaVidaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnviarDatos = async (imagen: Blob, gesto: string, cumple: boolean) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("imagen", imagen, "captura.jpg");
      formData.append("gesto", gesto);
      formData.append("cumple", cumple.toString());
      formData.append("usuario", "0e5c87c9-4ac0-499e-af8f-5291159161a7");

      const response = await fetch("http://localhost:3000/api/pruebas/con-imagen", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al enviar los datos");
      }

      console.log("Datos enviados correctamente");
      alert("Datos enviados correctamente.");
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Error al enviar los datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-xl p-24 w-2/4 h-5/6 flex flex-col justify-between lg:ml-[300px]">
        <div className="flex-1 overflow-y-auto">
          <PruebaVida onEnviarDatos={handleEnviarDatos} />
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl shadow-xl hover:bg-red-600 transition w-1/2"
          disabled={isSubmitting}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}