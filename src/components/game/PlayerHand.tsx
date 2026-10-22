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
    if (hasBoardCollision) return "⚡ 有人格子撞牌，請先收回";
    if (hasUnplayedCards) return `手牌還剩 ${hand.length} 張`;
    return `鎖定進度: ${lockedCount}/${totalPlayers} 人`;
  };

  const getLockActionLabel = () => {
    if (isLocked) return `已鎖定 (點擊取消)`;
    if (hasBoardCollision) return "有人撞牌無法鎖定";
    if (hasUnplayedCards) return "請先出完手牌";
    return `確認鎖定 (${lockedCount}/${totalPlayers})`;
  };

  const handleCardClick = (cardValue: number) => {
    if (disabled || isLocked) return;
    sound.playCardSlide();

    // 若有選牌 handler，觸發選牌；同時也可以直接 play
    if (onSelectCard) {
      onSelectCard(cardValue);
    } else {
      onPlayCard(cardValue);
    }
  };

  const totalCards = hand.length;
  const centerIdx = (totalCards - 1) / 2;

  return (
    <div className="w-full my-1 flex flex-col items-center justify-center relative z-20">
      {/* 狀態指示欄 */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-black text-[#18181b] bg-[#ffffff] px-2.5 py-1 rounded-lg border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b]">
          {playerName}
        </span>
        <span className="text-[11px] font-bold text-[#18181b] bg-[#f4f1ea] px-2.5 py-1 rounded-lg border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b]">
          {hand.length} 張手牌
        </span>
        <span
          className={clsx(
            "text-[11px] sm:text-xs px-2.5 py-1 rounded-lg border-2 border-[#18181b] font-black transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#18181b]",
            hasBoardCollision
              ? "bg-[#fee2e2] text-[#ef4444] animate-pulse"
              : isLocked
              ? "bg-[#d1fae5] text-[#065f46]"
              : "bg-[#ffffff] text-slate-700"
          )}
        >
          {hasBoardCollision && <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />}
          {getLockStatusText()}
        </span>
      </div>

      {/* 底部卡牌區 */}
      <div className="relative flex items-end justify-center min-h-[110px] sm:min-h-[125px] w-full max-w-xl py-1 px-2 overflow-visible">
        {hand.length === 0 ? (
          <div className="text-xs font-bold text-[#18181b] py-3.5 px-6 bg-[#ffffff] border-2 border-[#18181b] rounded-2xl text-center animate-fade-in shadow-[4px_4px_0px_#18181b] flex items-center gap-2">
            <span className="text-[#f59e0b] font-black text-sm">✨ 手牌已出完！</span>
            <span className="text-slate-600 font-medium">請按下「確認鎖定」，等待全員揭曉。</span>
          </div>
        ) : (
          hand.map((cardValue, idx) => {
            const offsetFromCenter = idx - centerIdx;
            const rotateDeg = totalCards > 1 ? offsetFromCenter * 3 : 0;
            const translateYPx = totalCards > 1 ? Math.abs(offsetFromCenter) * 2 : 0;
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

      {/* 底部執行鎖定按鈕 */}
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
              "px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black tracking-wider transition-all duration-100 flex items-center gap-2 select-none border-2 border-[#18181b] cursor-pointer",
              isLocked
                ? "bg-[#ef4444] text-white shadow-[3px_3px_0px_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#18181b]"
                : isLockDisabled
                ? "bg-[#e5e0d4] text-slate-400 cursor-not-allowed opacity-60 border-slate-400"
                : "bg-[#f59e0b] hover:bg-[#fbbf24] text-[#18181b] shadow-[4px_4px_0px_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#18181b]"
            )}
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 text-white" />
                <span>{getLockActionLabel()}</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-[#18181b]" />
                <span>{getLockActionLabel()}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
