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
  // 檢查數字下方是否有底線 (針對 6 與 9 避免混淆)
  const showUnderline = value === 6 || value === 9 || value === 66 || value === 99;

  // ASCII Glitch 抽搐特效 (當翻開且順序錯誤時觸發)
  const [glitchText, setGlitchText] = useState<string | null>(null);

  React.useEffect(() => {
    if (isError && flipped) {
      const glitchChars = ["¥#", "?!", "§∆", "ERR", "破!"];
      let count = 0;
      const interval = setInterval(() => {
        setGlitchText(glitchChars[count % glitchChars.length]);
        count++;
        if (count >= 6) {
          clearInterval(interval);
          setGlitchText(null);
        }
      }, 55);
      return () => clearInterval(interval);
    } else {
      setGlitchText(null);
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
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -14;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 14;
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
        "relative select-none cursor-pointer transition-transform duration-200 perspective-1000 touch-manipulation",
        "w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28",
        className
      )}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-8px) scale(1.08)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 右上角 ↗ 日式朱紅「確」落款印章 (個別玩家點擊鎖定時顯示，全場鎖定後自動消失) */}
      {showSeal && (
        <div className="absolute -top-1.5 -right-1.5 z-40 w-5 h-5 md:w-6 md:h-6 rounded ukiyo-seal flex items-center justify-center text-[10px] md:text-xs font-serif leading-none shadow-xl border border-ukiyo-cream/60 pointer-events-none animate-bounce">
          確
        </div>
      )}

      {/* 卡牌 3D 翻轉主體 */}
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative rounded-xl transition-transform shadow-xl hover:shadow-2xl",
          flipped ? "rotate-y-180" : "",
          isOwner ? "ring-2 ring-ukiyo-gold/80 shadow-ukiyo-gold/30" : "border border-ukiyo-foam/20"
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

        {/* 卡牌正面 (100% 不透明天然和紙實體牌面 + 和紙質感 + 墨黑數字 + 動態金箔光) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 washi-card-front text-[#1c2d37] rounded-xl p-1.5 flex flex-col items-center justify-center border border-ukiyo-gold/40 shadow-xl overflow-hidden">
          {/* 金箔流動高光反射層 */}
          {isHovered && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200 opacity-60 z-20"
              style={{
                background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255, 245, 205, 0.5) 0%, rgba(201, 169, 110, 0.15) 45%, transparent 75%)`,
              }}
            />
          )}

          {/* 金箔燙印微光細內框 */}
          <div className="absolute inset-1 rounded-lg border border-ukiyo-gold/25 pointer-events-none" />

          {/* 左上角 ↖ 斜對角小數字 */}
          <div className="absolute top-1.5 left-2 flex flex-col items-center z-10">
            <span
              className={clsx(
                "font-mono text-[10px] md:text-xs font-black text-ukiyo-ink leading-none tracking-tight",
                glitchText && "animate-ascii-glitch text-ukiyo-vermillion font-bold",
                showUnderline && "border-b-2 border-ukiyo-ink/80 pb-0.5"
              )}
            >
              {glitchText !== null ? glitchText : value}
            </span>
          </div>

          {/* 中央大數字 (墨黑水墨感 + 陰影深邃質感 + ASCII Glitch 支援) */}
          <div className="flex flex-col items-center justify-center my-auto z-10">
            <span
              className={clsx(
                "font-mono text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tighter text-ukiyo-ink leading-none drop-shadow-md",
                glitchText && "animate-ascii-glitch text-ukiyo-vermillion scale-110",
                showUnderline && "border-b-2 border-ukiyo-ink/90 pb-1"
              )}
            >
              {glitchText !== null ? glitchText : value}
            </span>
          </div>

          {/* 右下角 ↘ 斜對角小數字 (倒轉對稱) */}
          <div className="absolute bottom-1.5 right-2 flex flex-col items-center rotate-180 z-10">
            <span
              className={clsx(
                "font-mono text-[10px] md:text-xs font-black text-ukiyo-ink leading-none tracking-tight",
                glitchText && "animate-ascii-glitch text-ukiyo-vermillion font-bold",
                showUnderline && "border-b-2 border-ukiyo-ink/80 pb-0.5"
              )}
            >
              {glitchText !== null ? glitchText : value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
