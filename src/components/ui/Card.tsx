"use client";

import React from "react";
import { clsx } from "clsx";

interface CardProps {
  value: number;
  flipped?: boolean;
  isOwner?: boolean;
  playerName?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Card({
  value,
  flipped = false,
  isOwner = false,
  playerName,
  onClick,
  size = "md",
  className,
}: CardProps) {
  const sizeClasses = {
    sm: "w-12 h-16 text-lg",
    md: "w-16 h-24 text-2xl md:w-20 md:h-28 md:text-3xl",
    lg: "w-24 h-36 text-4xl md:w-28 md:h-40 md:text-5xl",
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "perspective-1000 cursor-pointer group relative inline-block transition-transform duration-300 hover:-translate-y-2",
        sizeClasses[size],
        className
      )}
    >
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative rounded-xl shadow-xl border-2 transition-transform",
          flipped ? "rotate-y-180" : "",
          isOwner ? "border-amber-400 shadow-glow-gold" : "border-gray-600"
        )}
      >
        {/* 卡牌背面 (未翻開) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-poker-bg rounded-xl p-1 flex flex-col items-center justify-between border border-poker-accent/40 overflow-hidden">
          <div className="w-full h-full rounded-lg border border-poker-accent/20 flex items-center justify-center bg-[radial-gradient(#d4a853_1px,transparent_1px)] [background-size:8px_8px]">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-poker-accent/50 flex items-center justify-center bg-poker-bg/80">
              <span className="text-poker-accent text-xs font-bold">🧠</span>
            </div>
          </div>
          {playerName && (
            <span className="absolute bottom-1 text-[10px] text-gray-300 bg-black/60 px-1 rounded truncate max-w-[90%]">
              {playerName}
            </span>
          )}
        </div>

        {/* 卡牌正面 (已翻開) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-amber-50 via-white to-amber-100 text-poker-bg rounded-xl border-2 border-poker-accent p-2 flex flex-col justify-between font-black shadow-inner">
          <div className="text-left leading-none">
            <span className="text-xs md:text-sm font-bold block opacity-75">{value}</span>
          </div>
          <div className="text-center my-auto">
            <span className="block drop-shadow-md">{value}</span>
          </div>
          <div className="text-right leading-none rotate-180">
            <span className="text-xs md:text-sm font-bold block opacity-75">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
