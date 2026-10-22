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

  // 賽博 ASCII Glitch 抽搐特效 (1.8s 崩潰狂跳 + 每 2.2s 間歇餘震)
  const [glitchText, setGlitchText] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isError || !flipped) {
      setGlitchText(null);
      return;
    }

    const glitchChars = ["ERR_0x", "FATAL!", "§∆#", "!DESYNC", "0xFF", "OVERFLOW", "✘✘✘", "CORRUPT"];
    let burstCount = 0;
    let echoInterval: NodeJS.Timeout | null = null;

    // 第一階段：劇烈崩潰期 (1.8 秒，每 90ms 切換，共 20 次)
    const burstInterval = setInterval(() => {
      setGlitchText(glitchChars[burstCount % glitchChars.length]);
      burstCount++;
      if (burstCount >= 20) {
        clearInterval(burstInterval);
        setGlitchText(null);

        // 第二階段：持續間歇餘震 (每 2.2 秒閃爍 0.45 秒)
        echoInterval = setInterval(() => {
          let flickerCount = 0;
          const flickerSub = setInterval(() => {
            setGlitchText(glitchChars[flickerCount % glitchChars.length]);
            flickerCount++;
            if (flickerCount >= 5) {
              clearInterval(flickerSub);
              setGlitchText(null);
            }
          }, 90);
        }, 2200);
      }
    }, 90);

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
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -14;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 14;
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
        "relative select-none cursor-pointer transition-transform duration-150 perspective-1000 touch-manipulation font-mono",
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
      {/* 右上角 ↗ 終端鎖定標籤 [LOCKED] */}
      {showSeal && (
        <div className="absolute -top-2 -right-2 z-40 px-1 py-0.5 bg-[#ff0055] text-white text-[9px] md:text-[10px] font-mono font-bold leading-none shadow-[0_0_8px_#ff0055] border border-white/60 pointer-events-none animate-pulse">
          LOCKED
        </div>
      )}

      {/* 卡匣 3D 翻轉主體 */}
      <div
        className={clsx(
          "w-full h-full duration-500 transform-style-3d relative transition-transform shadow-xl",
          flipped ? "rotate-y-180" : "",
          isOwner ? "ring-2 ring-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.4)]" : "border border-[#00ff9d]/30"
        )}
      >
        {/* 卡匣背面 (ASCII 晶片電路圖騰) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#04080e] border border-[#00ff9d]/60 p-1 flex flex-col items-center justify-center text-[#00ff9d] shadow-inner">
          <div className="w-full h-full border border-[#00ff9d]/30 flex flex-col items-center justify-center text-[8.5px] sm:text-[10px] md:text-[11.5px] leading-tight select-none whitespace-pre text-center">
            <div className="text-[7px] text-[#00e5ff] tracking-tighter mb-0.5">DATA_CART</div>
            <div>{"┌─────┐"}</div>
            <div>{"│░▒█▒░│"}</div>
            <div>{"│▒KEY▒│"}</div>
            <div>{"│░▒█▒░│"}</div>
            <div>{"└─────┘"}</div>
            <div className="text-[6.5px] text-[#00ff9d]/60 mt-0.5">ENC_256</div>
          </div>
        </div>

        {/* 卡匣正面 (高對比賽博黑底 + 螢光綠數位封包) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#020406] text-[#00ff9d] p-1.5 flex flex-col items-center justify-between border-2 border-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.3)]">
          {/* 頂部節點狀態 */}
          <div className="w-full flex items-center justify-between text-[8px] sm:text-[9px] text-[#00e5ff] font-bold border-b border-[#00ff9d]/30 pb-0.5">
            <span>PKG</span>
            <span className={clsx(glitchText && "animate-ascii-glitch text-[#ff0055]")}>
              {glitchText ? "ERR" : String(value).padStart(3, "0")}
            </span>
          </div>

          {/* 中央大數字 (ASCII Glitch 支援) */}
          <div className="flex flex-col items-center justify-center my-auto">
            <span
              className={clsx(
                "text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter leading-none drop-shadow-[0_0_8px_#00ff9d]",
                glitchText ? "animate-ascii-glitch text-lg sm:text-xl md:text-2xl" : "text-[#00ff9d]",
                showUnderline && "border-b-2 border-[#00ff9d] pb-0.5"
              )}
            >
              {glitchText !== null ? glitchText : value}
            </span>
          </div>

          {/* 底部條碼裝飾 */}
          <div className="w-full text-center text-[7px] sm:text-[8px] text-[#00ff9d]/60 tracking-widest font-mono border-t border-[#00ff9d]/30 pt-0.5 truncate">
            ||||| | |||| |
          </div>
        </div>
      </div>
    </div>
  );
}
