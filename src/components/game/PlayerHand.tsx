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
        "w-full glass-panel rounded-2xl md:rounded-3xl p-3 md:p-4 my-2 flex flex-col md:flex-row items-center justify-between gap-3 transition-all duration-300 shadow-2xl border",
        isLocked
          ? "border-ukiyo-gold/70 bg-ukiyo-surface/95"
          : "border-ukiyo-foam/20"
      )}
    >
      {/* 左側/頂部：玩家名稱、手牌數量與溫馨提示標籤 */}
      <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-2 md:gap-4 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-ukiyo-gold animate-pulse" />
          <span className="text-xs md:text-sm font-serif font-black text-ukiyo-gold tracking-wider">
            {playerName}
          </span>
          <span className="text-[10px] md:text-xs text-ukiyo-mist bg-ukiyo-bg/80 px-2.5 py-0.5 rounded-full border border-ukiyo-foam/15 font-serif">
            {hand.length} 張手牌
          </span>
        </div>

        {/* 鎖定按鈕 (手機端高能加強) */}
        {onToggleLock && (
          <div className="md:hidden">
            <Button
              variant={isLocked ? "secondary" : "primary"}
              size="sm"
              onClick={onToggleLock}
              disabled={isLockDisabled}
              className={clsx(
                "text-xs font-serif py-1.5 px-3 rounded-xl shadow-lg transition-all touch-manipulation active:scale-95",
                isLocked && "border-ukiyo-gold text-ukiyo-gold font-bold bg-ukiyo-gold/15"
              )}
            >
              {isLocked ? (
                <span className="flex items-center gap-1.5 text-ukiyo-gold font-bold">
                  <Lock className="w-3.5 h-3.5" /> 已鎖定 (點擊解鎖)
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" /> {getButtonTextMobile()}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 中間：手牌直立懸浮彈升 (Horizontal Elevator Deck) 區域 */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 md:gap-4 py-2 px-1 min-h-[96px] w-full md:w-auto">
        {hand.length === 0 ? (
          <div className="text-xs text-ukiyo-mist font-serif py-3 px-4 rounded-xl bg-ukiyo-bg/50 border border-ukiyo-foam/10 text-center animate-fade-in">
            ✨ 手牌已完全出完！請點擊「同意鎖定」等待同伴完成
          </div>
        ) : (
          hand.map((cardValue) => (
            <div
              key={cardValue}
              className="transition-transform duration-200 hover:-translate-y-4 active:-translate-y-2 touch-manipulation"
            >
              <Card
                value={cardValue}
                flipped={true} // 自己看得到數值
                isOwner={true}
                showSeal={isLocked}
                onClick={() => {
                  if (!disabled) onPlayCard(cardValue);
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* 右側：心靈鎖定按鈕 (桌面端顯示) */}
      {onToggleLock && (
        <div className="hidden md:flex flex-col items-end min-w-[200px]">
          <Button
            variant={isLocked ? "secondary" : "primary"}
            size="md"
            onClick={onToggleLock}
            disabled={isLockDisabled}
            className={clsx(
              "w-full text-xs font-serif transition-all touch-manipulation shadow-lg py-2.5 rounded-xl",
              isLocked && "border-ukiyo-gold text-ukiyo-gold font-bold bg-ukiyo-gold/15",
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
          <span className={`text-[10px] mt-1.5 font-serif ${hasBoardCollision ? "text-ukiyo-vermillion font-bold animate-pulse" : "text-ukiyo-mist font-mono"}`}>
            {getLockHintText()}
          </span>
        </div>
      )}
    </div>
  );
}
