import { useEffect } from "react";

export default function useDarkMode() {
  useEffect(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6; // Activa modo oscuro entre 6 PM y 6 AM

    if (isNight) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
}