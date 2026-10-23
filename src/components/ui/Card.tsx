"use client";

import React, { useState, useRef } from "react";
import clsx from "clsx";
import { sound } from "../../lib/soundEngine";

interface CardProps {
  value: number;
  flipped?: boolean;
  isOwner?: boolean;
  playerName?: string;
  showSeal?: boolean;
  isError?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

// 根據數值計算冷暖光譜色標
export function getSpectrumColor(val: number) {
  if (val <= 25) return { bg: "bg-[#0ea5e9]", text: "text-[#0ea5e9]", border: "border-[#0ea5e9]", icon: "❄️" };
  if (val <= 50) return { bg: "bg-[#10b981]", text: "text-[#10b981]", border: "border-[#10b981]", icon: "🌿" };
  if (val <= 75) return { bg: "bg-[#f59e0b]", text: "text-[#f59e0b]", border: "border-[#f59e0b]", icon: "☀️" };
  return { bg: "bg-[#ef4444]", text: "text-[#ef4444]", border: "border-[#ef4444]", icon: "🔥" };
}

export function Card({
  value,
  flipped = false,
  isOwner = false,
  playerName,
  showSeal = false,
  isError = false,
  isSelected = false,
  onClick,
  className,
}: CardProps) {
  const showUnderline = value === 6 || value === 9 || value === 66 || value === 99;
  const spec = getSpectrumColor(value);

  // 錯誤牌左右搖擺提示
  const [shake, setShake] = useState(false);
  React.useEffect(() => {
    if (isError && flipped) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isError, flipped]);

  // 3D 視差傾斜
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -10;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 10;
    setTilt({ rx, ry });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playCardSlide();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "relative select-none cursor-pointer transition-all duration-150 perspective-1000 touch-manipulation shrink-0",
        "w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28",
        isSelected && "-translate-y-4",
        shake && "animate-error-shake",
        className
      )}
      style={{
        transform: isSelected
          ? "translateY(-14px) scale(1.06)"
          : isHovered
          ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px) scale(1.05)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 右上角 ↗ 已鎖定印章 */}
      {showSeal && (
        <div className="absolute -top-2.5 -right-2.5 z-40 px-2 py-0.5 bg-[#10b981] text-white text-[11px] font-black rounded-lg border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] pointer-events-none animate-pulse">
          已鎖定
        </div>
      )}

      {/* 選中高亮浮標 */}
      {isSelected && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 bg-[#f59e0b] text-[#18181b] text-[10px] font-black rounded-full border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] pointer-events-none whitespace-nowrap animate-bounce">
          已選取
        </div>
      )}

      {/* 卡匣主體 */}
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative rounded-xl transition-transform border-2 border-[#18181b]",
          flipped ? "rotate-y-180" : "",
          isOwner && !isError
            ? "shadow-[4px_4px_0px_#f59e0b]"
            : "shadow-[4px_4px_0px_#18181b]"
        )}
      >
        {/* 卡牌背面 (未翻開：活力深海藍 + 粗黑邊框 + 幾何心印) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#1e293b] rounded-[10px] p-1.5 flex flex-col items-center justify-between text-[#f59e0b] shadow-inner">
          <div className="w-full flex justify-between items-center px-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]/50" />
            <span className="text-[9px] font-mono font-bold text-[#94a3b8]">MIND</span>
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]/50" />
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#f59e0b] bg-[#0f172a] flex items-center justify-center text-base sm:text-lg font-black text-[#f59e0b] shadow-[2px_2px_0px_#18181b]">
            心
          </div>

          <div className="text-[9px] font-mono font-bold text-[#f59e0b] tracking-wider bg-[#0f172a] px-2 py-0.5 rounded-full border border-[#f59e0b]/40">
            1 ~ 100
          </div>
        </div>

        {/* 卡牌正面 (純白實體卡面 + 粗黑大數字 + 左上角溫度色標) */}
        <div
          className={clsx(
            "absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[10px] p-2 flex flex-col items-center justify-between transition-colors",
            isError
              ? "bg-[#fee2e2] text-[#991b1b]"
              : "bg-[#ffffff] text-[#18181b]"
          )}
        >
          {/* 頂部溫度標籤 */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono font-black border-b border-slate-200 pb-0.5">
            <span className="flex items-center gap-1">
              <span>{spec.icon}</span>
              <span className="text-slate-600 font-bold">{String(value).padStart(2, "0")}</span>
            </span>
            <span className={clsx("w-2 h-2 rounded-full", spec.bg)} />
          </div>

          {/* 中央巨型數字 (極粗字體，一眼看清) */}
          <div className="flex flex-col items-center justify-center my-auto">
            <span
              className={clsx(
                "font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-none select-none text-[#18181b]",
                showUnderline && "border-b-4 border-[#18181b] pb-0.5"
              )}
            >
              {value}
            </span>
          </div>

          {/* 底部小標籤 */}
          <div className="w-full text-center text-[8px] font-bold tracking-widest text-slate-400 border-t border-slate-200 pt-0.5">
            MIND SYNC
          </div>
        </div>
      </div>
    </div>
  );
}
