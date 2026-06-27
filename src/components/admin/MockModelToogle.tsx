"use client";

import { isMockMode, setMockMode } from "@/services/rajaongkir/mock";
import { useEffect, useState } from "react";

export function MockModeToggle() {
  const [isMock, setIsMock] = useState(isMockMode());

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Define a custom interface for window with the new properties
      interface CustomWindow extends Window {
        isMockMode: () => boolean;
        toggleMockMode: () => void;
      }

      // Cast window to the custom interface
      const customWindow = window as unknown as CustomWindow;

      customWindow.isMockMode = isMockMode;
      customWindow.toggleMockMode = () => {
        const newMode = !isMockMode();
        setMockMode(newMode);
        setIsMock(newMode);
        window.location.reload();
      };
    }
  }, []);

  const toggle = () => {
    const newMode = !isMock;
    setIsMock(newMode);
    setMockMode(newMode);
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      className={`text-xs px-3 py-1.5 rounded-full ${
        isMock
          ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/50"
          : "bg-green-500/20 text-green-600 border border-green-500/50"
      }`}
    >
      {isMock ? "⚡ Mock" : "🌐 Live"}
    </button>
  );
}
