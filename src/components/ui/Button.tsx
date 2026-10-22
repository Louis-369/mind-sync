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
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer tracking-wide";

  const variants = {
    primary: "bg-[#f59e0b] hover:bg-[#fbbf24] text-black shadow-md border border-[#f59e0b]",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-md border border-red-500",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white",
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
