"use client";

import React from "react";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "../ui/Card";
import { sound } from "../../lib/soundEngine";

interface PlayerHandProps {
  hand: number[];
  playerName: string;
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
    if (hasUnplayedCards) return `請先落盡手牌 (尚餘 ${hand.length} 張)`;
    return `全體同意進度: ${lockedCount}/${totalPlayers} 人`;
  };

  const getLockActionLabel = () => {
    if (isLocked) return `已鎖定 (點擊撤回)`;
    if (hasBoardCollision) return "席位重疊無法鎖定";
    if (hasUnplayedCards) return "請先出完手牌";
    return `確認鎖定 (${lockedCount}/${totalPlayers})`;
  };

  const handleCardSelect = (cardValue: number) => {
    if (disabled || isLocked) return;
    sound.playCardSlide();
    onPlayCard(cardValue);
  };

  const totalCards = hand.length;
  const centerIdx = (totalCards - 1) / 2;

  return (
    <div className="w-full my-1 flex flex-col items-center justify-center relative z-20">
      {/* 狀態指示欄 */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-bold text-[#f59e0b]">
          {playerName}
        </span>
        <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {hand.length} 張手牌
        </span>
        <span className={clsx(
          "text-[11px] sm:text-xs px-2.5 py-0.5 rounded border transition-all flex items-center gap-1.5",
          hasBoardCollision
            ? "bg-red-950/80 border-red-500 text-red-400 font-bold animate-pulse"
            : isLocked
            ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold"
            : "bg-slate-800 border-slate-700 text-slate-300"
        )}>
          {hasBoardCollision && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
          {getLockStatusText()}
        </span>
      </div>

      {/* 底部卡牌區 */}
      <div className="relative flex items-end justify-center min-h-[110px] sm:min-h-[125px] w-full max-w-xl py-1 px-2 overflow-visible">
        {hand.length === 0 ? (
          <div className="text-xs text-white py-3 px-6 bg-[#12161f] border border-slate-700 rounded-xl text-center animate-fade-in shadow-lg flex items-center gap-2">
            <span className="text-[#f59e0b] font-bold">✨ 手牌已完全出完！</span>
            <span className="text-slate-300">請點擊下方按鈕確認鎖定，等待全員揭牌。</span>
          </div>
        ) : (
          hand.map((cardValue, idx) => {
            const offsetFromCenter = idx - centerIdx;
            const rotateDeg = totalCards > 1 ? offsetFromCenter * 4 : 0;
            const translateYPx = totalCards > 1 ? Math.abs(offsetFromCenter) * 3 : 0;

            return (
              <div
                key={cardValue}
                style={{
                  transform: `translateY(${translateYPx}px) rotate(${rotateDeg}deg)`,
                  marginLeft: idx > 0 ? (totalCards > 4 ? "-16px" : "-8px") : "0px",
                  zIndex: idx + 10,
                }}
                className="transition-all duration-200 hover:z-30 hover:-translate-y-5"
              >
                <Card
                  value={cardValue}
                  flipped={true}
                  isOwner={true}
                  showSeal={isLocked}
                  onClick={() => handleCardSelect(cardValue)}
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
              "px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 shadow-xl flex items-center gap-2 cursor-pointer active:scale-95",
              isLocked
                ? "bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                : isLockDisabled
                ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                : "bg-[#f59e0b] hover:bg-[#fbbf24] text-black border border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse"
            )}
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 text-white" />
                <span>{getLockActionLabel()}</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-black" />
                <span>{getLockActionLabel()}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
