"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import PruebaVidaModal from "@/components/modals/PruebaVidaModal";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [showModal, setShowModal] = useState(true); // Controla la visibilidad del modal
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
  const router = useRouter();

  const handleModalClose = () => {
    setShowModal(false); // Cierra el modal
  };

  useEffect(() => {
    // Simula la verificación de autenticación
    const checkAuth = async () => {
      const user = await fetch("/"); // Cambia esto según tu lógica de autenticación
      if (!user.ok) {
        router.push("/signin"); // Redirige a la página de inicio de sesión si no hay sesión
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return null; // O un loader mientras se verifica la autenticación
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Modal de Prueba de Vida */}
      {showModal && (
        <div className="relative z-50">
          <PruebaVidaModal onClose={handleModalClose} />
        </div>
      )}
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}