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

// 根據數值計算冷暖光譜微色標 (和風古典色系)
export function getSpectrumColor(val: number) {
  if (val <= 25) return { bg: "bg-[#0ea5e9]", text: "text-[#0ea5e9]", border: "border-[#0ea5e9]", icon: "❄️" };
  if (val <= 50) return { bg: "bg-[#10b981]", text: "text-[#10b981]", border: "border-[#10b981]", icon: "🌿" };
  if (val <= 75) return { bg: "bg-[#c9a96e]", text: "text-[#c9a96e]", border: "border-[#c9a96e]", icon: "☀️" };
  return { bg: "bg-[#c73e1d]", text: "text-[#c73e1d]", border: "border-[#c73e1d]", icon: "🔥" };
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

  // 錯誤牌震顫動效
  const [shake, setShake] = useState(false);
  React.useEffect(() => {
    if (isError && flipped) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isError, flipped]);

  // 3D 視差傾斜 (3D Tilt) 與金箔反光位置
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ rx: number; ry: number; gx: number; gy: number }>({
    rx: 0,
    ry: 0,
    gx: 50,
    gy: 50,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -12;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 12;
    const gx = (x / rect.width) * 100;
    const gy = (y / rect.height) * 100;
    setTilt({ rx, ry, gx, gy });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playCardSlide();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
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
        shake && "animate-ascii-glitch",
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
      {/* 右上角 ↗ 日式朱紅「確」落款印章 */}
      {showSeal && (
        <div
          title="已鎖定"
          aria-label="已鎖定"
          className="absolute -top-2 -right-2 z-40 w-5 h-5 sm:w-6 sm:h-6 rounded ukiyo-seal flex items-center justify-center text-[10px] sm:text-xs font-serif leading-none shadow-xl pointer-events-none animate-bounce"
        >
          <span>確</span>
          <span className="sr-only">已鎖定</span>
        </div>
      )}

      {/* 選中高亮浮標 */}
      {isSelected && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 bg-[#c9a96e] text-[#0d1b2a] text-[10px] font-black rounded-full border border-white shadow-md pointer-events-none whitespace-nowrap animate-bounce">
          已選取
        </div>
      )}

      {/* 卡匣主體 */}
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative rounded-xl transition-transform shadow-xl",
          flipped ? "rotate-y-180" : "",
          isOwner && !isError
            ? "ring-2 ring-[#c9a96e] shadow-[0_0_15px_rgba(201,169,110,0.35)]"
            : "border border-[rgba(201,169,110,0.3)]"
        )}
      >
        {/* 卡牌背面 (浮世繪深海藍海浪底色 + 燙金邊框 + 朱紅心印) */}
        <div className="absolute inset-0 w-full h-full backface-hidden ukiyo-card-back rounded-xl p-1 flex flex-col items-center justify-between text-[#c9a96e] shadow-inner overflow-hidden">
          <div className="w-full flex justify-between items-center px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]/40" />
            <span className="text-[8px] font-serif text-[#c9a96e]/80">心天秤</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]/40" />
          </div>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ukiyo-seal flex items-center justify-center text-xs sm:text-sm font-serif shadow-lg border border-[#e8dcc8]/60">
            心
          </div>

          <div className="text-[8px] sm:text-[9px] font-mono text-[#c9a96e]/80 tracking-wider">
            1 ~ 100
          </div>
        </div>

        {/* 卡牌正面 (100% 不透明天然金米色和紙纖維底 + 水墨大黑字 + 動態金箔流動光) */}
        <div
          className={clsx(
            "absolute inset-0 w-full h-full backface-hidden rotate-y-180 washi-card-front rounded-xl p-1.5 flex flex-col items-center justify-between shadow-xl overflow-hidden transition-colors",
            isError && "bg-[#fee2e2] text-[#991b1b] border-[#c73e1d]!"
          )}
        >
          {/* 金箔流動高光反射層 */}
          {isHovered && !isError && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200 opacity-50 z-20"
              style={{
                background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255, 245, 205, 0.6) 0%, rgba(201, 169, 110, 0.15) 50%, transparent 75%)`,
              }}
            />
          )}

          {/* 燙金細內框 */}
          <div className="absolute inset-1 rounded-lg border border-[rgba(201,169,110,0.3)] pointer-events-none" />

          {/* 左上角斜對角溫度微色標 + 小數字 */}
          <div className="w-full flex items-center justify-between text-[10px] sm:text-xs font-mono font-black z-10 border-b border-[#c9a96e]/25 pb-0.5">
            <span className="flex items-center gap-1">
              <span>{spec.icon}</span>
              <span className="text-[#2a2a2a]">{String(value).padStart(2, "0")}</span>
            </span>
            <span className={clsx("w-2 h-2 rounded-full", spec.bg)} />
          </div>

          {/* 中央大數字 (墨黑水墨大字) */}
          <div className="flex flex-col items-center justify-center my-auto z-10">
            <span
              className={clsx(
                "font-mono text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tighter leading-none select-none text-[#1c2d37] drop-shadow-sm",
                showUnderline && "border-b-2 border-[#1c2d37] pb-0.5"
              )}
            >
              {value}
            </span>
          </div>

          {/* 底部小字 */}
          <div className="w-full text-center text-[7.5px] font-serif text-[#8a9bb0] z-10 border-t border-[#c9a96e]/20 pt-0.5 tracking-widest">
            MIND SYNC
          </div>
        </div>
      </div>
    </div>
  );
}
