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
          isOwner ? "border-ukiyo-foam/50" : "border-ukiyo-wave/30"
        )}
      >
        {/* 卡牌背面 (浮世繪海浪質感極簡純圖騰) */}
        <div className="absolute inset-0 w-full h-full backface-hidden ukiyo-card-back rounded-xl p-1 flex flex-col items-center justify-center border border-ukiyo-foam/20 overflow-hidden">
          <div className="w-full h-full rounded-lg border border-ukiyo-foam/15 flex items-center justify-center">
            {/* 朱紅日式心印 */}
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full ukiyo-seal flex items-center justify-center text-xs font-serif shadow-md">
              心
            </div>
          </div>
        </div>

        {/* 卡牌正面 (和紙古紙墨書風) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 ukiyo-card-front rounded-xl p-1.5 flex flex-col items-center justify-center border border-ukiyo-ink/20 shadow-inner overflow-hidden">
          {/* 右上角 ↗ 斜對角小數字 (帶腳底實體橫線) */}
          <div className="absolute top-1.5 right-2 flex flex-col items-center">
            <span className="font-mono text-[10px] md:text-xs font-black text-ukiyo-ink border-b border-ukiyo-ink/70 pb-0.5 leading-none">
              {value}
            </span>
          </div>

          {/* 中央大數字 (帶腳底實體橫線) */}
          <div className="flex flex-col items-center justify-center">
            <span className="font-mono text-xl md:text-3xl font-black text-ukiyo-ink tracking-tight border-b-2 md:border-b-4 border-ukiyo-ink/70 pb-0.5 leading-none">
              {value}
            </span>
          </div>

          {/* 左下角 ↙ 斜對角小數字 (旋轉 180 度，帶腳底實體橫線) */}
          <div className="absolute bottom-1.5 left-2 flex flex-col items-center rotate-180">
            <span className="font-mono text-[10px] md:text-xs font-black text-ukiyo-ink border-b border-ukiyo-ink/70 pb-0.5 leading-none">
              {value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
