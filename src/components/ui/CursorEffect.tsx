"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function CursorEffect() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const trailX = useMotionValue(-100);
  const trailY = useMotionValue(-100);
  const trailXSpring = useSpring(trailX, { damping: 35, stiffness: 100, mass: 0.8 });
  const trailYSpring = useSpring(trailY, { damping: 35, stiffness: 100, mass: 0.8 });

  const requestRef = useRef<number>(0);
  const isVisible = useRef(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);

      if (!isVisible.current) {
        isVisible.current = true;
      }
    };

    const handleMouseLeave = () => {
      cursorX.set(-100);
      cursorY.set(-100);
      trailX.set(-100);
      trailY.set(-100);
      isVisible.current = false;
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(requestRef.current);
    };
  }, [cursorX, cursorY, trailX, trailY]);

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white" />
      </motion.div>

      {/* Trailing ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: trailXSpring,
          y: trailYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="w-10 h-10 rounded-full border border-accent/40" />
      </motion.div>

      {/* Glow trail */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9997]"
        style={{
          x: trailXSpring,
          y: trailYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="w-24 h-24 rounded-full bg-accent/5 blur-xl" />
      </motion.div>
    </>
  );
}
