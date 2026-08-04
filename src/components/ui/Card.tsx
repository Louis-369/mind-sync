"use client";

import React from "react";
import clsx from "clsx";

interface CardProps {
  value: number;
  flipped?: boolean;
  isOwner?: boolean;
  playerName?: string;
  showSeal?: boolean;
  showPreviewText?: boolean;
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
        "relative select-none cursor-pointer transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0",
        "w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28"
      )}
    >
      {/* 卡牌 3D 翻轉主體 */}
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative rounded-xl border transition-transform shadow-xl",
          flipped ? "rotate-y-180" : "",
          isOwner ? "border-ukiyo-gold/60" : "border-ukiyo-wave/40"
        )}
      >
        {/* 卡牌背面 (浮世繪海浪質感極簡純圖騰) */}
        <div className="absolute inset-0 w-full h-full backface-hidden ukiyo-card-back rounded-xl p-1 flex flex-col items-center justify-center border border-ukiyo-foam/20 overflow-hidden relative">
          {/* 右上角 ↗ 日式朱紅「確」落款印章 (個別玩家點擊鎖定時顯示，全場鎖定後自動消失) */}
          {showSeal && (
            <div className="absolute top-1.5 right-1.5 z-20 w-4 h-4 md:w-5 md:h-5 rounded ukiyo-seal flex items-center justify-center text-[9px] md:text-[10px] font-serif leading-none shadow-sm opacity-90 pointer-events-none animate-fade-in">
              確
            </div>
          )}

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

          {/* 右上角 ↗ 日式朱紅「確」落款印章 (個別玩家點擊鎖定時顯示，全場鎖定後自動消失) */}
          {showSeal && (
            <div className="absolute top-1.5 right-1.5 z-20 w-4 h-4 md:w-5 md:h-5 rounded ukiyo-seal flex items-center justify-center text-[9px] md:text-[10px] font-serif leading-none shadow-sm opacity-90 pointer-events-none animate-fade-in">
              確
            </div>
          )}

          {/* 中央大數字 */}
          <div className="flex flex-col items-center justify-center my-auto">
            <span
              className={clsx(
                "font-mono text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tighter text-ukiyo-ink leading-none drop-shadow-sm",
                showUnderline && "border-b-2 border-ukiyo-ink/80 pb-1"
              )}
            >
              {value}
            </span>
          </div>

          {/* 右下角 ↘ 斜對角小數字 (倒轉對稱) */}
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

      {/* 擁有者視角預覽點數 */}
      {isOwner && !flipped && (
        <div className="absolute bottom-1 right-1 z-20 bg-ukiyo-bg/90 border border-ukiyo-gold/60 text-ukiyo-gold font-mono font-bold text-[10px] sm:text-xs px-1.5 py-0.5 rounded shadow">
          {value}
        </div>
      )}
    </div>
  );
}
