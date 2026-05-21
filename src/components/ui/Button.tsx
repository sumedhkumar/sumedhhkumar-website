"use client";

import { motion } from "motion/react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: () => void;
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer";

  const variants = {
    primary: "bg-accent text-black hover:bg-accent-hover glow",
    secondary:
      "border border-card-border bg-card text-foreground hover:border-accent/50 hover:text-accent",
    ghost: "text-muted hover:text-foreground",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  const MotionComponent = href ? motion.a : motion.button;

  return (
    <MotionComponent
      href={href}
      onClick={onClick}
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </MotionComponent>
  );
}
