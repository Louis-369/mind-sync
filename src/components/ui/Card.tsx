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

// 判斷是否為顛倒易混淆的數字（包含 6、9 或顛倒後可能看錯的數字）
function isAmbiguousNumber(num: number): boolean {
  const str = String(num);
  return str.includes("6") || str.includes("9") || num === 18 || num === 81;
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

  const showUnderline = isAmbiguousNumber(value);

  return (
    <div
      onClick={onClick}
      className={clsx(
        "perspective-1000 cursor-pointer group relative inline-block transition-all duration-300 hover:-translate-y-2.5 hover:shadow-[0_12px_24px_rgba(201,169,110,0.3)]",
        sizeClasses[size],
        className
      )}
    >
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative rounded-xl border transition-transform shadow-xl",
          flipped ? "rotate-y-180" : "",
          isOwner ? "border-ukiyo-gold/60" : "border-ukiyo-wave/40"
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

        {/* 卡牌正面 (100% 不透明天然和紙實體牌面) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 washi-card-front text-[#1c2d37] rounded-xl p-1.5 flex flex-col items-center justify-center border border-ukiyo-ink/25 shadow-md overflow-hidden relative">
          {/* 左上角 ↖ 斜對角小數字 */}
          <div className="absolute top-1.5 left-2 flex flex-col items-center">
            <span
              className={clsx(
                "font-mono text-[10px] md:text-xs font-black text-ukiyo-ink leading-none",
                showUnderline && "border-b border-ukiyo-ink/70 pb-0.5"
              )}
            >
              {value}
            </span>
          </div>

          {/* 右上角 ↗ 日式朱紅「確」落款印章 */}
          <div className="absolute top-1.5 right-1.5 w-4 h-4 md:w-5 md:h-5 rounded ukiyo-seal flex items-center justify-center text-[9px] md:text-[10px] font-serif leading-none shadow-sm opacity-90 pointer-events-none">
            確
          </div>

          {/* 中央大數字 */}
          <div className="flex flex-col items-center justify-center">
            <span
              className={clsx(
                "font-mono text-xl md:text-3xl font-black text-ukiyo-ink tracking-tight leading-none drop-shadow-sm",
                showUnderline && "border-b md:border-b-2 border-ukiyo-ink/80 pb-0.5"
              )}
            >
              {value}
            </span>
          </div>

          {/* 右下角 ↘ 斜對角小數字 (旋轉 180 度) */}
          <div className="absolute bottom-1.5 right-2 flex flex-col items-center rotate-180">
            <span
              className={clsx(
                "font-mono text-[10px] md:text-xs font-black text-ukiyo-ink leading-none",
                showUnderline && "border-b border-ukiyo-ink/70 pb-0.5"
              )}
            >
              {value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
