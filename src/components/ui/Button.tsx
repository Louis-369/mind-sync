"use client";

import React, { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "green" | "red" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "gold",
  size = "md",
  className,
  children,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    gold: "bg-gradient-to-r from-amber-500 to-poker-accent text-poker-bg hover:from-amber-400 hover:to-yellow-300 shadow-glow-gold border border-amber-300",
    green: "bg-gradient-to-r from-emerald-600 to-poker-tableBorder text-white hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/30",
    red: "bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 border border-red-400/30",
    ghost: "bg-poker-cardBg/10 text-gray-200 hover:bg-poker-cardBg/20 border border-white/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg tracking-wide",
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
