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
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer tracking-wider";

  const variants = {
    primary: "bg-ukiyo-indigo hover:bg-ukiyo-indigoHover text-ukiyo-foam border border-ukiyo-foam/20 shadow-ukiyo-soft",
    secondary: "bg-ukiyo-wave hover:bg-ukiyo-wave/80 text-ukiyo-foam border border-ukiyo-foam/20",
    danger: "bg-ukiyo-vermillion hover:bg-red-800 text-ukiyo-cream border border-red-400/30",
    ghost: "bg-ukiyo-surface/60 hover:bg-ukiyo-surface text-ukiyo-mist border border-ukiyo-foam/10",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base md:text-lg font-serif",
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
