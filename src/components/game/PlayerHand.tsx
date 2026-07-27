"use client";

import React from "react";
import { Card } from "../ui/Card";

interface PlayerHandProps {
  hand: number[];
  playerName: string;
  onPlayCard: (cardValue: number) => void;
  disabled?: boolean;
}

export function PlayerHand({
  hand,
  playerName,
  onPlayCard,
  disabled = false,
}: PlayerHandProps) {
  return (
    <div className="w-full glass-panel rounded-2xl p-4 mt-4 flex flex-col items-center border-amber-500/30">
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <span className="text-sm font-bold text-poker-accent">
          {playerName} 的手牌 ({hand.length} 張)
        </span>
        <span className="text-xs text-gray-400">
          點擊手牌打出至中央盤面
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-2 min-h-[110px]">
        {hand.length === 0 ? (
          <div className="text-sm text-gray-500 font-medium py-4">
            手牌已清空！等待團隊心靈同步結果...
          </div>
        ) : (
          hand.map((cardValue) => (
            <Card
              key={cardValue}
              value={cardValue}
              flipped={true} // 自己永遠看得到自己的數值
              isOwner={true}
              onClick={() => {
                if (!disabled) onPlayCard(cardValue);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
