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
          "w-full h-full duration-500 transform-style-3d relative rounded-xl shadow-ukiyo-soft border transition-transform",
          flipped ? "rotate-y-180" : "",
          isOwner ? "border-ukiyo-gold shadow-ukiyo-glow" : "border-ukiyo-wave/40"
        )}
      >
        {/* 卡牌背面 (浮世繪海浪質感) */}
        <div className="absolute inset-0 w-full h-full backface-hidden ukiyo-card-back rounded-xl p-1 flex flex-col items-center justify-between border border-ukiyo-foam/20 overflow-hidden">
          <div className="w-full h-full rounded-lg border border-ukiyo-foam/15 flex items-center justify-center">
            {/* 朱紅日式心印 */}
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full ukiyo-seal flex items-center justify-center text-xs font-serif shadow-md">
              心
            </div>
          </div>
          {playerName && (
            <span className="absolute bottom-1 text-[10px] text-ukiyo-cream bg-ukiyo-bg/80 px-1.5 py-0.5 rounded truncate max-w-[90%] font-serif">
              {playerName}
            </span>
          )}
        </div>

        {/* 卡牌正面 (和紙古紙墨書風) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-ukiyo-cream via-amber-50 to-ukiyo-foam text-ukiyo-ink rounded-xl border border-ukiyo-gold p-2 flex flex-col justify-between font-black shadow-inner">
          <div className="text-left leading-none font-serif">
            <span className="text-xs md:text-sm block opacity-80">{value}</span>
          </div>
          <div className="text-center my-auto">
            <span className="block drop-shadow-sm font-sans tracking-tight">{value}</span>
          </div>
          <div className="text-right leading-none rotate-180 font-serif">
            <span className="text-xs md:text-sm block opacity-80">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
