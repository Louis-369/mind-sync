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
  onToggleLock,
  disabled = false,
}: PlayerHandProps) {
  return (
    <div
      className={clsx(
        "w-full glass-panel rounded-2xl p-3 md:p-4 mt-2 flex flex-col md:flex-row items-center justify-between gap-3 transition-all duration-300 shadow-xl border",
        isLocked
          ? "border-ukiyo-gold/60 bg-ukiyo-surface/90"
          : "border-ukiyo-foam/15"
      )}
    >
      {/* 左側/頂部：玩家名稱與手牌數量 */}
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-serif font-bold text-ukiyo-gold flex items-center gap-1.5">
            {playerName}
            {isLocked && (
              <span className="text-[9px] bg-ukiyo-gold/20 text-ukiyo-gold border border-ukiyo-gold/40 font-serif px-2 py-0.5 rounded-full">
                ✓ 心靈確認
              </span>
            )}
          </span>
          <span className="text-[11px] text-ukiyo-mist bg-ukiyo-surface/80 px-2 py-0.5 rounded-full border border-ukiyo-foam/10">
            {hand.length} 張手牌
          </span>
        </div>

        {/* 鎖定按鈕 (手機端顯示) */}
        {onToggleLock && (
          <div className="md:hidden">
            <Button
              variant={isLocked ? "secondary" : "primary"}
              size="sm"
              onClick={onToggleLock}
              disabled={disabled}
              className="text-xs font-serif"
            >
              {isLocked ? (
                <span className="flex items-center gap-1 text-ukiyo-gold font-bold">
                  <Lock className="w-3.5 h-3.5" /> 已鎖定 ({lockedCount}/{totalPlayers})
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" /> 同意鎖定 ({lockedCount}/{totalPlayers})
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
            手牌已清空，靜候心靈判定結果...
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
        <div className="hidden md:flex flex-col items-end min-w-[150px]">
          <Button
            variant={isLocked ? "secondary" : "primary"}
            size="md"
            onClick={onToggleLock}
            disabled={disabled}
            className={clsx(
              "w-full text-xs font-serif transition-all",
              isLocked && "border-ukiyo-gold text-ukiyo-gold font-bold"
            )}
          >
            {isLocked ? (
              <span className="flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4 text-ukiyo-gold" /> 已同意鎖定
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Unlock className="w-4 h-4 text-ukiyo-gold" /> 同意鎖定
              </span>
            )}
          </Button>
          <span className="text-[10px] text-ukiyo-mist mt-1 font-mono">
            同意進度: {lockedCount}/{totalPlayers} 人
          </span>
        </div>
      )}
    </div>
  );
}
