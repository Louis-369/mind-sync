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
      <div className="w-16 h-24 md:w-20 md:h-28 rounded-xl border-2 border-dashed border-poker-tableBorder/50 bg-poker-table/30 flex items-center justify-center text-poker-tableBorder/40">
        <span className="text-xs">出牌區</span>
      </div>
    );
  }

  const handleCardClick = () => {
    if (card.flipped) return;

    if (isCurrentPlayer && onRecall) {
      // 自己的未翻牌，可以點擊收回
      onRecall(slotId);
    } else if (onFlip) {
      // 點擊翻開
      onFlip(slotId);
    }
  };

  return (
    <div className="relative group">
      <Card
        value={card.cardValue}
        flipped={card.flipped || isFlipped}
        isOwner={isCurrentPlayer}
        playerName={card.playerName}
        onClick={handleCardClick}
      />
      {isCurrentPlayer && !card.flipped && (
        <span className="absolute -top-2 -right-2 bg-poker-accent text-poker-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          點擊收回
        </span>
      )}
    </div>
  );
}
