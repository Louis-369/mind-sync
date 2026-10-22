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
    "inline-flex items-center justify-center font-black rounded-xl transition-all duration-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer tracking-wider select-none";

  const variants = {
    primary:
      "bg-[#f59e0b] hover:bg-[#fbbf24] text-[#18181b] border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#18181b]",
    secondary:
      "bg-[#ffffff] hover:bg-[#f4f1ea] text-[#18181b] border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#18181b]",
    danger:
      "bg-[#ef4444] hover:bg-[#f87171] text-white border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#18181b]",
    ghost:
      "bg-transparent hover:bg-[#e7e1d5]/60 text-[#52525b] hover:text-[#18181b] border-2 border-transparent active:scale-95",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg shadow-[2px_2px_0px_#18181b] active:shadow-[0px_0px_0px_#18181b]",
    md: "px-4 py-2 text-xs sm:text-sm",
    lg: "px-6 py-3 text-sm sm:text-base shadow-[4px_4px_0px_#18181b] active:shadow-[2px_2px_0px_#18181b]",
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
