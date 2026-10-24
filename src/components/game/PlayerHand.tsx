"use client";

import React from "react";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "../ui/Card";
import { sound } from "../../lib/soundEngine";

interface PlayerHandProps {
  hand: number[];
  playerName: string;
  selectedCard?: number | null;
  onSelectCard?: (cardValue: number) => void;
  onPlayCard: (cardValue: number) => void;
  isLocked?: boolean;
  lockedCount?: number;
  totalPlayers?: number;
  hasBoardCollision?: boolean;
  onToggleLock?: () => void;
  disabled?: boolean;
}

export function PlayerHand({
  hand,
  playerName,
  selectedCard = null,
  onSelectCard,
  onPlayCard,
  isLocked = false,
  lockedCount = 0,
  totalPlayers = 1,
  hasBoardCollision = false,
  onToggleLock,
  disabled = false,
}: PlayerHandProps) {
  const hasUnplayedCards = hand.length > 0;
  const isLockDisabled = (disabled || hasBoardCollision || hasUnplayedCards) && !isLocked;

  const getLockStatusText = () => {
    if (hasBoardCollision) return "⚡ 席位重疊，請先讓席";
    if (hasUnplayedCards) return `手牌還剩 ${hand.length} 張`;
    return `全體同意進度: ${lockedCount}/${totalPlayers} 人`;
  };

  const getLockActionLabel = () => {
    if (isLocked) return `已蓋印 (點擊撤回)`;
    if (hasBoardCollision) return "席位重疊無法鎖定";
    if (hasUnplayedCards) return "請先出完手牌";
    return `蓋印定案 (${lockedCount}/${totalPlayers})`;
  };

  const handleCardClick = (cardValue: number) => {
    if (disabled || isLocked) return;
    sound.playCardSlide();

    // 點擊即出牌，流暢自然
    if (onPlayCard) {
      onPlayCard(cardValue);
    } else if (onSelectCard) {
      onSelectCard(cardValue);
    }
  };

  const totalCards = hand.length;
  const centerIdx = (totalCards - 1) / 2;

  return (
    <div className="w-full my-1 flex flex-col items-center justify-center relative z-20">
      {/* 狀態指示欄 */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-bold text-[#c9a96e]">
          {playerName}
        </span>
        <span className="text-[11px] text-[#e8dcc8] bg-[#162436] px-2.5 py-0.5 rounded border border-[rgba(201,169,110,0.3)]">
          {hand.length} 張手牌
        </span>
        <span
          className={clsx(
            "text-[11px] sm:text-xs px-2.5 py-0.5 rounded border font-bold transition-all flex items-center gap-1.5 shadow-sm",
            hasBoardCollision
              ? "bg-[#c73e1d]/80 border-white text-white animate-pulse"
              : isLocked
              ? "bg-[#064e3b]/80 border-[#34d399] text-[#34d399]"
              : "bg-[#162436] border-[rgba(201,169,110,0.3)] text-[#e8dcc8]"
          )}
        >
          {hasBoardCollision && <AlertTriangle className="w-3.5 h-3.5 text-white" />}
          {getLockStatusText()}
        </span>
      </div>

      {/* 底部卡牌區 (扇形展開) */}
      <div className="relative flex items-end justify-center min-h-[110px] sm:min-h-[125px] w-full max-w-xl py-1 px-2 overflow-visible">
        {hand.length === 0 ? (
          <div className="text-xs font-bold text-[#f5f0e3] py-3.5 px-6 glass-panel text-center animate-fade-in shadow-xl flex items-center gap-2">
            <span className="text-[#c9a96e] font-black text-sm">✨ 手牌已出完！</span>
            <span className="text-[#8a9bb0]">請點擊下方「蓋印定案」，等待全體驗收。</span>
          </div>
        ) : (
          hand.map((cardValue, idx) => {
            const offsetFromCenter = idx - centerIdx;
            const rotateDeg = totalCards > 1 ? offsetFromCenter * 3.5 : 0;
            const translateYPx = totalCards > 1 ? Math.abs(offsetFromCenter) * 2.5 : 0;
            const isSelected = selectedCard === cardValue;

            return (
              <div
                key={cardValue}
                style={{
                  transform: `translateY(${translateYPx}px) rotate(${rotateDeg}deg)`,
                  marginLeft: idx > 0 ? (totalCards > 4 ? "-16px" : "-8px") : "0px",
                  zIndex: isSelected ? 40 : idx + 10,
                }}
                className="transition-all duration-200 hover:z-30 hover:-translate-y-5"
              >
                <Card
                  value={cardValue}
                  flipped={true}
                  isOwner={true}
                  showSeal={isLocked}
                  isSelected={isSelected}
                  onClick={() => handleCardClick(cardValue)}
                />
              </div>
            );
          })
        )}
      </div>

      {/* 底部執行鎖定按鈕 (朱紅落款風格) */}
      {onToggleLock && (
        <div className="mt-1.5 flex items-center justify-center">
          <button
            onClick={() => {
              if (isLockDisabled) {
                sound.playCollisionWarn();
                return;
              }
              sound.playLockSeal();
              onToggleLock();
            }}
            disabled={isLockDisabled}
            className={clsx(
              "px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider transition-all duration-150 flex items-center gap-2 select-none border cursor-pointer active:scale-95",
              isLocked
                ? "bg-[#c73e1d] hover:bg-[#db4823] text-white border-white shadow-[0_0_20px_rgba(199,62,29,0.5)]"
                : isLockDisabled
                ? "bg-[#162436]/60 border-[rgba(201,169,110,0.2)] text-[#8a9bb0]/50 cursor-not-allowed opacity-50"
                : "bg-[#c73e1d] hover:bg-[#db4823] text-white border-[#f5f0e3] shadow-[0_0_20px_rgba(199,62,29,0.5)] animate-pulse"
            )}
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 text-white" />
                <span>{getLockActionLabel()}</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-white" />
                <span>{getLockActionLabel()}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
