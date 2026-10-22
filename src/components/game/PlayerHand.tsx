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
    if (hasBoardCollision) return "[!! COLLISION_DETECTED: PLEASE RESOLVE !!]";
    if (hasUnplayedCards) return `[INSERT_ALL_PACKETS: ${hand.length} REMAINING]`;
    return `[SYNC_COMMIT_PROGRESS: ${lockedCount}/${totalPlayers}]`;
  };

  const getLockActionLabel = () => {
    if (isLocked) return `[ REVERT_LOCK // 撤回鎖定 ]`;
    if (hasBoardCollision) return "[ ERR: COLLISION_ACTIVE ]";
    if (hasUnplayedCards) return "[ ERR: UNCOMMITTED_PACKETS ]";
    return `[ COMMIT_SYNC // 執行同步鎖定 (${lockedCount}/${totalPlayers}) ]`;
  };

  const handleCardSelect = (cardValue: number) => {
    if (disabled || isLocked) return;
    sound.playCardSlide();
    onPlayCard(cardValue);
  };

  const totalCards = hand.length;
  const centerIdx = (totalCards - 1) / 2;

  return (
    <div className="w-full my-1 flex flex-col items-center justify-center relative z-20 font-mono">
      {/* 狀態指示欄 */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-bold text-[#00ff9d]">
          &gt; {playerName}
        </span>
        <span className="text-[10px] text-[#00e5ff] bg-black/80 px-2 py-0.5 border border-[#00e5ff]/40">
          PACKETS: {hand.length}
        </span>
        <span className={clsx(
          "text-[10px] sm:text-xs px-2.5 py-0.5 border transition-all flex items-center gap-1.5",
          hasBoardCollision
            ? "bg-[#ff0055]/20 border-[#ff0055] text-[#ff0055] font-bold animate-pulse"
            : isLocked
            ? "bg-[#00ff9d]/20 border-[#00ff9d] text-[#00ff9d] font-bold"
            : "bg-black/80 border-[#00ff9d]/30 text-[#00ff9d]/70"
        )}>
          {hasBoardCollision && <AlertTriangle className="w-3 h-3 text-[#ff0055]" />}
          {getLockStatusText()}
        </span>
      </div>

      {/* 底部卡匣槽位架 (Cyber Deck) */}
      <div className="relative flex items-end justify-center min-h-[110px] sm:min-h-[125px] w-full max-w-xl py-1 px-2 overflow-visible">
        {hand.length === 0 ? (
          <div className="text-xs text-[#00ff9d] py-3 px-6 bg-[#030609]/95 border-2 border-[#00ff9d] text-center animate-fade-in shadow-[0_0_15px_rgba(0,255,157,0.3)] flex items-center gap-2">
            <span className="text-[#00e5ff] font-bold">&gt;&gt; ALL_PACKETS_DISPATCHED!</span>
            <span>點擊下方按鈕提交鎖定，等待同伴揭牌。</span>
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
              "px-5 py-2 font-mono text-xs sm:text-sm font-bold tracking-widest transition-all duration-200 shadow-xl flex items-center gap-2 cursor-pointer active:scale-95",
              isLocked
                ? "bg-[#ff0055] text-white border-2 border-white shadow-[0_0_15px_#ff0055]"
                : isLockDisabled
                ? "bg-black/60 border border-[#00ff9d]/20 text-[#00ff9d]/30 cursor-not-allowed opacity-50"
                : "bg-[#00ff9d] text-black border-2 border-[#00ff9d] hover:bg-white shadow-[0_0_20px_#00ff9d] animate-pulse"
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
