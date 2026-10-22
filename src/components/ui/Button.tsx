"use client";

import React, { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-mono font-bold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer tracking-wider";

  const variants = {
    primary: "bg-[#00ff9d] hover:bg-white text-black border border-[#00ff9d] shadow-[0_0_12px_rgba(0,255,157,0.5)]",
    secondary: "bg-black/80 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/70 shadow-[0_0_8px_rgba(0,229,255,0.3)]",
    danger: "bg-[#ff0055] hover:bg-white hover:text-[#ff0055] text-white border border-white shadow-[0_0_12px_#ff0055]",
    ghost: "bg-transparent hover:bg-[#00ff9d]/10 text-[#00ff9d]/70 hover:text-[#00ff9d] border border-transparent",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-xs sm:text-sm",
    lg: "px-6 py-2.5 text-sm sm:text-base font-bold",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
