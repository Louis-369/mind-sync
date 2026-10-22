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
  onClick?: () => void;
  className?: string;
}

export function Card({
  value,
  flipped = false,
  isOwner = false,
  playerName,
  showSeal = false,
  isError = false,
  onClick,
  className,
}: CardProps) {
  const showUnderline = value === 6 || value === 9 || value === 66 || value === 99;

  // 錯誤牌跳動提示 (1.8s 高頻跳動 + 每 2.2s 間歇提醒)
  const [glitchText, setGlitchText] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isError || !flipped) {
      setGlitchText(null);
      return;
    }

    const glitchChars = ["排錯!", "順序錯!", "✕✕", "卡住!"];
    let burstCount = 0;
    let echoInterval: NodeJS.Timeout | null = null;

    // 第一階段：爆發跳動期 (1.8 秒)
    const burstInterval = setInterval(() => {
      setGlitchText(glitchChars[burstCount % glitchChars.length]);
      burstCount++;
      if (burstCount >= 18) {
        clearInterval(burstInterval);
        setGlitchText(null);

        // 第二階段：持續間歇提醒 (每 2.2 秒閃現 0.45 秒)
        echoInterval = setInterval(() => {
          let flickerCount = 0;
          const flickerSub = setInterval(() => {
            setGlitchText(glitchChars[flickerCount % glitchChars.length]);
            flickerCount++;
            if (flickerCount >= 4) {
              clearInterval(flickerSub);
              setGlitchText(null);
            }
          }, 90);
        }, 2200);
      }
    }, 100);

    return () => {
      clearInterval(burstInterval);
      if (echoInterval) clearInterval(echoInterval);
    };
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
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -12;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 12;
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
        "relative select-none cursor-pointer transition-transform duration-150 perspective-1000 touch-manipulation",
        "w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28",
        className
      )}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px) scale(1.06)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 右上角 ↗ 已鎖定標籤 */}
      {showSeal && (
        <div className="absolute -top-2 -right-2 z-40 px-1.5 py-0.5 bg-[#10b981] text-white text-[10px] font-bold rounded shadow-lg border border-white pointer-events-none animate-pulse">
          已鎖定
        </div>
      )}

      {/* 卡牌主體 */}
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative rounded-lg transition-transform shadow-xl",
          flipped ? "rotate-y-180" : "",
          isOwner ? "ring-2 ring-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "border border-slate-600"
        )}
      >
        {/* 卡牌背面 (未翻開：深藍底 + 字符框 + 心字) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#141b29] border-2 border-[#f59e0b]/80 rounded-lg p-1 flex flex-col items-center justify-center text-[#f59e0b] shadow-inner">
          <div className="w-full h-full border border-[#f59e0b]/30 rounded flex flex-col items-center justify-center text-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#f59e0b] bg-[#1e293b] flex items-center justify-center text-xs sm:text-sm font-bold text-[#f59e0b] shadow-sm mb-1">
              心
            </div>
            <div className="text-[8px] sm:text-[9px] font-mono text-[#f59e0b]/70 tracking-wider">
              1 ~ 100
            </div>
          </div>
        </div>

        {/* 卡牌正面 (純白實體卡面 + 粗黑大數字) */}
        <div className={clsx(
          "absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg p-1.5 flex flex-col items-center justify-between border-2 shadow-2xl transition-colors",
          isError
            ? "bg-[#fee2e2] text-[#991b1b] border-[#ef4444]"
            : "bg-white text-[#090d16] border-[#e2e8f0]"
        )}>
          {/* 左上角小數字 */}
          <div className="w-full flex items-center justify-between text-[10px] sm:text-xs font-mono font-bold text-slate-500 border-b border-slate-200 pb-0.5">
            <span className={clsx(glitchText && "text-red-600 font-black animate-ascii-glitch")}>
              {glitchText ? "✕" : String(value).padStart(2, "0")}
            </span>
            <span className="text-[8px] text-slate-400">1~100</span>
          </div>

          {/* 中央巨型數字 */}
          <div className="flex flex-col items-center justify-center my-auto">
            <span
              className={clsx(
                "font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-none select-none",
                glitchText ? "text-red-600 animate-ascii-glitch text-lg sm:text-xl" : "text-[#090d16]",
                showUnderline && "border-b-3 border-[#090d16] pb-0.5"
              )}
            >
              {glitchText !== null ? glitchText : value}
            </span>
          </div>

          {/* 底部裝飾條 */}
          <div className="w-full text-center text-[8px] text-slate-400 font-bold tracking-widest border-t border-slate-200 pt-0.5">
            心天秤
          </div>
        </div>
      </div>
    </div>
  );
}
