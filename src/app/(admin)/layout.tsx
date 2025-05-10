"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AdvertenciaPrivacidad from "@/components/Modal/AdvertenciaPrivacidad";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
  const router = useRouter();

  useEffect(() => {
    // Verifica si el modal ya se mostró en esta sesión
    const modalShown = sessionStorage.getItem("privacyModalShown");
    if (!modalShown) {
      setShowModal(true); // Muestra el modal si no se ha mostrado
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem("privacyModalShown", "true"); // Marca el modal como mostrado
    setShowModal(false); // Oculta el modal
  };

  const handleReject = () => {
    // Elimina cualquier cookie o estado relacionado con la sesión
    document.cookie = "passedPruebaVida=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/signin"); // Redirige al usuario a la página de inicio de sesión
  };

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Modal de Advertencia de Privacidad */}
      {showModal && (
        <div className="relative z-50">
          <AdvertenciaPrivacidad onAccept={handleAccept} onReject={handleReject} />
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