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
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer tracking-wide select-none";

  const variants = {
    primary:
      "bg-[#c9a96e] hover:bg-[#d8be8d] text-[#162436] font-extrabold shadow-[0_4px_15px_rgba(201,169,110,0.35)] border border-[#e8dcc8]/60",
    secondary:
      "bg-[#1b2838] hover:bg-[#25374d] text-[#e8dcc8] border border-[rgba(201,169,110,0.35)] shadow-md",
    danger:
      "bg-[#c73e1d] hover:bg-[#db4823] text-white border border-[#ff8e72]/50 shadow-[0_4px_15px_rgba(199,62,29,0.4)]",
    ghost:
      "bg-transparent hover:bg-[#1b2838]/80 text-[#8a9bb0] hover:text-[#e8dcc8] border border-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-xs sm:text-sm",
    lg: "px-6 py-2.5 text-sm sm:text-base font-extrabold",
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
