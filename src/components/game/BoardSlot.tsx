"use client";

import React from "react";
import { Card } from "../ui/Card";
import { BoardCard } from "../../types/game";

interface BoardSlotProps {
  slotId: string;
  card?: BoardCard;
  isCurrentPlayer: boolean;
  isFlipped?: boolean;
  onRecall?: (slotId: string) => void;
  onFlip?: (slotId: string) => void;
}

export function BoardSlot({
  slotId,
  card,
  isCurrentPlayer,
  isFlipped = false,
  onRecall,
  onFlip,
}: BoardSlotProps) {
  if (!card) {
    return (
      <div className="w-16 h-24 md:w-20 md:h-28 rounded-xl border border-dashed border-ukiyo-foam/20 bg-ukiyo-surface/30 flex items-center justify-center text-ukiyo-mist/40">
        <span className="text-[11px] font-serif">席位</span>
      </div>
    );
  }

  const handleCardClick = () => {
    // 若已翻開則點擊無效
    if (card.flipped) return;

    // 自己出的牌，未翻開時可翻牌
    if (isCurrentPlayer && onFlip) {
      onFlip(slotId);
    }
  };

  return (
    <div className="relative group flex flex-col items-center">
      <Card
        value={card.cardValue}
        flipped={card.flipped || isFlipped}
        isOwner={isCurrentPlayer}
        playerName={card.playerName}
        onClick={handleCardClick}
      />

      {/* 出牌者標籤 (底部固定顯示) */}
      <div className="mt-1 flex items-center space-x-1">
        <span
          className={`text-[10px] font-serif px-1.5 py-0.5 rounded border truncate max-w-[80px] ${
            isCurrentPlayer
              ? "bg-ukiyo-gold/20 text-ukiyo-gold border-ukiyo-gold/40 font-bold"
              : "bg-ukiyo-surface/80 text-ukiyo-mist border-ukiyo-foam/10"
          }`}
        >
          {card.playerName || "匿名"} {isCurrentPlayer ? "(你)" : ""}
        </span>
      </div>

      {/* 提示可點擊翻開標籤 (僅自己且未翻開時) */}
      {isCurrentPlayer && !card.flipped && (
        <span className="absolute -top-2.5 bg-ukiyo-gold text-ukiyo-bg text-[9px] font-serif font-bold px-1.5 py-0.5 rounded-full shadow animate-pulse">
          點擊翻牌
        </span>
      )}
    </div>
  );
}
