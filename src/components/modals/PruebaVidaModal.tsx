"use client";

import React, { useState, useEffect } from "react";
import PruebaVida from "../prueba-vida/PruebaVida";

interface PruebaVidaModalProps {
  onClose: () => void;
}

export default function PruebaVidaModal({ onClose }: PruebaVidaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [respuestaAPI, setRespuestaAPI] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Obtenemos el userId del localStorage cuando el componente se monta
  useEffect(() => {
    // Necesitamos verificar que estamos en el cliente antes de acceder a localStorage
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("No se encontró el ID de usuario en localStorage");
    }
  }, []);

  // Función para convertir blob a imagen JPEG mediante canvas y guardarla como archivo
  const convertToJpegFile = (inputBlob: Blob): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Crear un elemento imagen para cargar el blob original
      const img = new Image();
      img.onload = () => {
        // Crear un canvas con las dimensiones de la imagen
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dibujar la imagen en el canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del canvas"));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convertir el canvas a Blob (imagen JPG)
        canvas.toBlob((blob) => {
          if (blob) {
            console.log("Imagen convertida a JPEG correctamente");
            // Convertir el Blob a File (que es un tipo especial de Blob)
            const fileName = "captura.jpg";
            const file = new File([blob], fileName, { type: "image/jpeg" });
            resolve(file);
            
            // Guardar para depuración
            const downloadUrl = URL.createObjectURL(file);
            setUploadedImageUrl(downloadUrl);
          } else {
            reject(new Error("Error al convertir la imagen a JPEG"));
          }
        }, 'image/jpeg', 0.9); // Calidad 0.9 (90%)
      };
      
      img.onerror = () => {
        reject(new Error("Error al cargar la imagen para conversión"));
      };
      
      // Cargar el blob en la imagen
      img.src = URL.createObjectURL(inputBlob);
    });
  };

  const handleEnviarDatos = async (imagen: Blob, gesto: string, cumple: boolean) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setRespuestaAPI(null);
    setImageFile(null);

    try {
      if (!userId) {
        throw new Error("No se encontró el ID de usuario");
      }

      console.log("Detalles de la imagen original:");
      console.log("- Es un Blob:", imagen instanceof Blob);
      console.log("- Tipo MIME:", imagen.type);
      console.log("- Tamaño en bytes:", imagen.size);
      
      // Convertir la imagen a File con formato JPEG
      console.log("Convirtiendo imagen a formato JPEG...");
      const jpegFile = await convertToJpegFile(imagen);
      setImageFile(jpegFile);
      
      console.log("Detalles del archivo JPEG:");
      console.log("- Nombre:", jpegFile.name);
      console.log("- Tipo MIME:", jpegFile.type);
      console.log("- Tamaño en bytes:", jpegFile.size);
      
      // Para depuración - mostrar y descargar la imagen
      if (process.env.NODE_ENV === 'development') {
        const downloadLink = document.createElement('a');
        downloadLink.href = uploadedImageUrl;
        downloadLink.download = 'captura.jpg';
        downloadLink.click();
        console.log("Imagen descargada para depuración");
      }
      
      // Crear FormData con el archivo JPEG (no el blob original)
      const formData = new FormData();
      formData.append("imagen", jpegFile);
      formData.append("gesto", gesto);
      formData.append("cumple", cumple.toString());
      formData.append("usuario", userId);
      
      console.log("Contenido del FormData:");
      for (const pair of formData.entries()) {
        if (pair[0] === 'imagen') {
          console.log(`- ${pair[0]}: [File objeto] nombre=${(pair[1] as File).name}, tipo=${(pair[1] as File).type}, tamaño=${(pair[1] as File).size} bytes`);
        } else {
          console.log(`- ${pair[0]}: ${pair[1]}`);
        }
      }
      
      // INTENTAR ENDPOINT DE CARGA DE IMÁGENES PRIMERO
      console.log("Subiendo imagen al servidor...");
      
      // Crear FormData solo para la imagen
      const imageFormData = new FormData();
      imageFormData.append("file", jpegFile);
      imageFormData.append("usuario", userId);
      
      // Subir la imagen a un endpoint específico
      const uploadResponse = await fetch("http://localhost:3008/api/prueba/con-imagen", {
        method: "POST",
        body: imageFormData
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => "No details");
        throw new Error(`Error al subir la imagen: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }
      
      // Obtener la URL de la imagen subida
      const uploadResult = await uploadResponse.json();
      const imagenUrl = uploadResult.url;
      console.log("Imagen subida exitosamente, URL:", imagenUrl);
      setUploadedImageUrl(imagenUrl);
      
      // Enviar el resto de datos en formato JSON con la URL de la imagen
      const datosJSON = {
        gesto: gesto,
        cumple: cumple.toString(),
        imagen: imagenUrl,
        usuario: userId
      };
      
      console.log("Enviando datos JSON con URL de imagen:", datosJSON);
      
      // Enviar los datos JSON
      const jsonResponse = await fetch("http://localhost:3008/api/pruebas/con-imagen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosJSON)
      });
      
      if (!jsonResponse.ok) {
        const errorText = await jsonResponse.text().catch(() => "No details");
        throw new Error(`Error al enviar los datos JSON: ${jsonResponse.status} ${jsonResponse.statusText} - ${errorText}`);
      }
      
      // Procesar respuesta
      const jsonData = await jsonResponse.json();
      console.log("Respuesta exitosa (JSON):", jsonData);
      setRespuestaAPI(jsonData);
      
      alert("Datos enviados correctamente.");
      
    } catch (error) {
      console.error("Error detallado al enviar los datos:", error);
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setErrorMessage("No se pudo conectar con el servidor. Verifica que el servidor esté en ejecución en http://localhost:3008.");
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Error desconocido al enviar los datos.");
      }
      
      alert(error instanceof Error ? error.message : "Error desconocido al enviar los datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-xl p-8 w-2/4 h-5/6 flex flex-col lg:ml-[300px]">
        <div className="flex-1 overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{errorMessage}</p>
            </div>
          )}
          
          {uploadedImageUrl && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Imagen procesada:</h3>
              <div className="relative h-48 w-full bg-gray-200 rounded-md overflow-hidden">
                <img 
                  src={uploadedImageUrl} 
                  alt="Imagen capturada"
                  className="object-contain w-full h-full" 
                  onError={(e) => {
                    console.error("Error al cargar la imagen:", e);
                    e.currentTarget.alt = "Error al cargar la imagen";
                  }}
                />
              </div>
              <p className="mt-2 text-xs break-all">{uploadedImageUrl}</p>
            </div>
          )}
          
          {respuestaAPI && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
              <h3 className="font-medium mb-2">Respuesta del servidor:</h3>
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(respuestaAPI, null, 2)}
              </pre>
            </div>
          )}
          
          <PruebaVida onEnviarDatos={handleEnviarDatos} />
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-xl hover:bg-red-600 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Cerrar"}
          </button>
          
          {uploadedImageUrl && (
            <a 
              href={uploadedImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow-xl hover:bg-blue-600 transition"
            >
              Ver imagen
            </a>
          )}
        </div>
      </div>
    </div>
  );
}