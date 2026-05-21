"use client";

import { useEffect, useRef } from "react";

export default function SpotlightBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--x", `${e.clientX}px`);
        spotlightRef.current.style.setProperty("--y", `${e.clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-50"
      style={{
        background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(202, 138, 4, 0.04), transparent 40%)`,
      }}
    />
  );
}
