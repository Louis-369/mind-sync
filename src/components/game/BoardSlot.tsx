"use client";

import React from "react";
import { Card } from "../ui/Card";
import { BoardCard } from "../../types/game";

interface BoardSlotProps {
  slotId: string;
  card?: BoardCard;
  status?: string;
  isOwnerLocked?: boolean;
  isCurrentPlayer: boolean;
  isFlipped?: boolean;
  onRecall?: (slotId: string) => void;
  onFlip?: (slotId: string) => void;
}

export function BoardSlot({
  slotId,
  card,
  status = "playing",
  isOwnerLocked = false,
  isCurrentPlayer,
  isFlipped = false,
  onRecall,
  onFlip,
}: BoardSlotProps) {
  if (!card) {
    return (
      <div className="w-16 h-24 md:w-20 md:h-28 rounded-xl border border-dashed border-ukiyo-foam/20 bg-ukiyo-surface/30 flex items-center justify-center text-ukiyo-mist/40">
        <span className="text-[11px] font-serif">空席位</span>
      </div>
    );
  }

  const handleCardClick = () => {
    // 若已翻開則點擊無效
    if (card.flipped) return;

    if (isCurrentPlayer) {
      if (status === "playing" && onRecall) {
        // 未全鎖定前：點擊自己的牌為「收回手牌」
        onRecall(slotId);
      } else if (status === "locked" && onFlip) {
        // 已全鎖定後：點擊自己的牌為「翻開亮牌」
        onFlip(slotId);
      }
    }
  };

  return (
    <div className="relative group flex flex-col items-center">
      {/* 鎖定同意朱紅落款小印章 */}
      {isOwnerLocked && (
        <div
          title="已完成心靈確認"
          className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded ukiyo-seal flex items-center justify-center text-[10px] shadow-md border border-ukiyo-cream/30 font-serif"
        >
          認
        </div>
      )}

      <Card
        value={card.cardValue}
        flipped={card.flipped || isFlipped}
        isOwner={isCurrentPlayer}
        playerName={card.playerName}
        onClick={handleCardClick}
      />

      {/* 出牌者標籤 (極簡和紙風) */}
      <div className="mt-1 flex items-center space-x-1">
        <span
          className={`text-[10px] font-serif px-1.5 py-0.5 rounded border truncate max-w-[85px] transition-colors ${
            isCurrentPlayer
              ? "bg-ukiyo-surface/90 text-ukiyo-gold border-ukiyo-gold/40 font-bold"
              : "bg-ukiyo-surface/60 text-ukiyo-mist border-ukiyo-foam/10"
          }`}
        >
          {card.playerName || "匿名"} {isCurrentPlayer ? "(你)" : ""}
        </span>
      </div>

      {/* 提示標籤 (僅自己且未翻開時) */}
      {isCurrentPlayer && !card.flipped && (
        <span
          className={`absolute -top-2.5 text-[9px] font-serif px-1.5 py-0.5 rounded-full shadow ${
            status === "locked"
              ? "bg-ukiyo-surface border border-ukiyo-gold text-ukiyo-gold font-bold"
              : "bg-ukiyo-surface border border-ukiyo-foam/30 text-ukiyo-mist"
          }`}
        >
          {status === "locked" ? "可點擊翻牌" : "可點擊收回"}
        </span>
      )}
    </div>
  );
}
