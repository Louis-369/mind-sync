"use client";

import React from "react";
import { Lock, Unlock } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

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

  const getLockHintText = () => {
    if (hasBoardCollision) return "⚠️ 盤面有撞牌，請先收回卡牌";
    if (hasUnplayedCards) return "⚠️ 請先將手牌全部出完";
    return `同意進度: ${lockedCount}/${totalPlayers} 人`;
  };

  const getButtonTextMobile = () => {
    if (hasBoardCollision) return "撞牌無法鎖定";
    return `同意鎖定 (${lockedCount}/${totalPlayers})`;
  };

  const getButtonTextDesktop = () => {
    if (hasBoardCollision) return "撞牌無法鎖定";
    return `同意鎖定 (${lockedCount}/${totalPlayers})`;
  };

  return (
    <div
      className={clsx(
        "w-full glass-panel rounded-2xl p-3 md:p-4 mt-2 flex flex-col md:flex-row items-center justify-between gap-3 transition-all duration-300 shadow-xl border",
        isLocked
          ? "border-ukiyo-gold/60 bg-ukiyo-surface/90"
          : "border-ukiyo-foam/15"
      )}
    >
      {/* 左側/頂部：玩家名稱、手牌數量與溫馨提示標籤 */}
      <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2 md:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-serif font-bold text-ukiyo-gold">
            {playerName}
          </span>
          <span className="text-[11px] text-ukiyo-mist bg-ukiyo-surface/80 px-2 py-0.5 rounded-full border border-ukiyo-foam/10">
            {hand.length} 張手牌
          </span>
          {!isLocked ? (
            <span className="text-[10px] text-ukiyo-gold font-serif bg-ukiyo-gold/10 px-2 py-0.5 rounded-full border border-ukiyo-gold/30 flex items-center gap-1 shadow-sm">
              💡 點擊盤面卡牌可收回
            </span>
          ) : (
            <span className="text-[10px] text-ukiyo-gold font-serif bg-ukiyo-gold/10 px-2 py-0.5 rounded-full border border-ukiyo-gold/30 flex items-center gap-1 shadow-sm animate-pulse">
              💡 全員鎖定，靜候答案揭曉
            </span>
          )}
        </div>

        {/* 鎖定按鈕 (手機端顯示) */}
        {onToggleLock && (
          <div className="md:hidden">
            <Button
              variant={isLocked ? "secondary" : "primary"}
              size="sm"
              onClick={onToggleLock}
              disabled={isLockDisabled}
              className="text-xs font-serif"
            >
              {isLocked ? (
                <span className="flex items-center gap-1 text-ukiyo-gold font-bold">
                  <Lock className="w-3.5 h-3.5" /> 已鎖定 (點擊解開)
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" /> {getButtonTextMobile()}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 中間：手牌卡片 */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 py-1 min-h-[90px]">
        {hand.length === 0 ? (
          <div className="text-xs text-ukiyo-mist font-serif py-2">
            手牌已清空，全員鎖定靜候答案揭曉...
          </div>
        ) : (
          hand.map((cardValue) => (
            <Card
              key={cardValue}
              value={cardValue}
              flipped={true} // 自己看得到數值
              isOwner={true}
              onClick={() => {
                if (!disabled) onPlayCard(cardValue);
              }}
            />
          ))
        )}
      </div>

      {/* 右側：心靈鎖定按鈕 (桌面端顯示) */}
      {onToggleLock && (
        <div className="hidden md:flex flex-col items-end min-w-[180px]">
          <Button
            variant={isLocked ? "secondary" : "primary"}
            size="md"
            onClick={onToggleLock}
            disabled={isLockDisabled}
            className={clsx(
              "w-full text-xs font-serif transition-all touch-manipulation",
              isLocked && "border-ukiyo-gold text-ukiyo-gold font-bold",
              isLockDisabled && "opacity-60 cursor-not-allowed"
            )}
          >
            {isLocked ? (
              <span className="flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4 text-ukiyo-gold" /> 已鎖定 (點擊解開)
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Unlock className="w-4 h-4 text-ukiyo-gold" /> {getButtonTextDesktop()}
              </span>
            )}
          </Button>
          <span className={`text-[10px] mt-1 font-serif ${hasBoardCollision || hasUnplayedCards ? "text-ukiyo-vermillion font-bold animate-pulse" : "text-ukiyo-mist font-mono"}`}>
            {getLockHintText()}
          </span>
        </div>
      )}
    </div>
  );
}
