"use client";

import React from "react";
import clsx from "clsx";

interface CardProps {
  value: number;
  flipped?: boolean;
  isOwner?: boolean;
  playerName?: string;
  showSeal?: boolean;
  onClick?: () => void;
}

export function Card({
  value,
  flipped = false,
  isOwner = false,
  playerName,
  showSeal = false,
  onClick,
}: CardProps) {
  // 檢查數字下方是否有底線 (針對 6 與 9 避免混淆)
  const showUnderline = value === 6 || value === 9 || value === 66 || value === 99;

  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative select-none cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-105 active:scale-95 active:translate-y-0 perspective-1000",
        "w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28"
      )}
    >
      {/* 右上角 ↗ 日式朱紅「確」落款印章 (個別玩家點擊鎖定時顯示，全場鎖定後自動消失) */}
      {showSeal && (
        <div className="absolute -top-1 -right-1 z-30 w-4 h-4 md:w-5 md:h-5 rounded ukiyo-seal flex items-center justify-center text-[9px] md:text-[10px] font-serif leading-none shadow-lg border border-ukiyo-foam/40 pointer-events-none animate-bounce">
          確
        </div>
      )}

      {/* 卡牌 3D 翻轉主體 */}
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative rounded-xl transition-transform shadow-xl hover:shadow-2xl",
          flipped ? "rotate-y-180" : "",
          isOwner ? "ring-2 ring-ukiyo-gold/80 shadow-ukiyo-gold/20" : "border border-ukiyo-foam/20"
        )}
      >
        {/* 卡牌背面 (浮世繪海浪質感極簡純圖騰 + 金箔古紋) */}
        <div className="absolute inset-0 w-full h-full backface-hidden ukiyo-card-back rounded-xl p-1 flex flex-col items-center justify-center border border-ukiyo-gold/30 overflow-hidden shadow-inner">
          <div className="w-full h-full rounded-lg border border-ukiyo-gold/25 flex flex-col items-center justify-center relative bg-gradient-to-b from-ukiyo-surface/80 to-ukiyo-bg/90">
            {/* 朱紅日式心印 */}
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full ukiyo-seal flex items-center justify-center text-xs md:text-sm font-serif shadow-lg border border-ukiyo-gold/40">
              心
            </div>
          </div>
        </div>

        {/* 卡牌正面 (100% 不透明天然和紙實體牌面 + 和紙質感 + 墨黑數字) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 washi-card-front text-[#1c2d37] rounded-xl p-1.5 flex flex-col items-center justify-center border border-ukiyo-gold/40 shadow-xl overflow-hidden">
          {/* 金箔燙印微光細內框 */}
          <div className="absolute inset-1 rounded-lg border border-ukiyo-gold/20 pointer-events-none" />

          {/* 左上角 ↖ 斜對角小數字 */}
          <div className="absolute top-1.5 left-2 flex flex-col items-center z-10">
            <span
              className={clsx(
                "font-mono text-[10px] md:text-xs font-black text-ukiyo-ink leading-none tracking-tight",
                showUnderline && "border-b-2 border-ukiyo-ink/80 pb-0.5"
              )}
            >
              {value}
            </span>
          </div>

          {/* 中央大數字 (墨黑水墨感 + 陰影深邃質感) */}
          <div className="flex flex-col items-center justify-center my-auto z-10">
            <span
              className={clsx(
                "font-mono text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tighter text-ukiyo-ink leading-none drop-shadow-md",
                showUnderline && "border-b-2 border-ukiyo-ink/90 pb-1"
              )}
            >
              {value}
            </span>
          </div>

          {/* 右下角 ↘ 斜對角小數字 (倒轉對稱) */}
          <div className="absolute bottom-1.5 right-2 flex flex-col items-center rotate-180 z-10">
            <span
              className={clsx(
                "font-mono text-[10px] md:text-xs font-black text-ukiyo-ink leading-none tracking-tight",
                showUnderline && "border-b-2 border-ukiyo-ink/80 pb-0.5"
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
