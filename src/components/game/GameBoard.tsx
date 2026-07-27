"use client";

import React from "react";
import { BoardSlot } from "./BoardSlot";
import { BoardCard } from "../../types/game";

interface GameBoardProps {
  board: (BoardCard & { slotId: string })[];
  currentConnectionId: string;
  status: string;
  totalPlayers?: number;
  cardsPerPlayer?: number;
  onRecallCard?: (slotId: string) => void;
  onFlipCard?: (slotId: string) => void;
}

export function GameBoard({
  board,
  currentConnectionId,
  status,
  totalPlayers = 2,
  cardsPerPlayer = 2,
  onRecallCard,
  onFlipCard,
}: GameBoardProps) {
  // 按放置時間排序展示已打出的牌
  const sortedBoard = [...board].sort((a, b) => a.placedAt - b.placedAt);

  // 計算本局總共預計發出的卡牌總數 (總空槽數)
  const totalSlotsCount = Math.max(totalPlayers * cardsPerPlayer, 4);
  const emptySlotsCount = Math.max(totalSlotsCount - sortedBoard.length, 0);

  return (
    <div className="w-full flex-1 min-h-[300px] md:min-h-[360px] bg-gradient-to-b from-ukiyo-surface/90 via-ukiyo-bg/95 to-ukiyo-surface/90 rounded-3xl p-4 md:p-6 border border-ukiyo-foam/15 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden my-2">
      {/* 背景水墨波浪浮水印 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-ukiyo-foam flex items-center justify-center">
          <span className="text-8xl font-serif text-ukiyo-foam">心</span>
        </div>
      </div>

      {/* 狀態提示 */}
      <div className="relative z-10 text-center mb-3">
        <span className="text-xs tracking-widest text-ukiyo-gold font-serif font-bold bg-ukiyo-bg/60 px-3 py-1 rounded-full border border-ukiyo-foam/10">
          {status === "playing"
            ? `已落牌 ${sortedBoard.length} / ${totalSlotsCount} 張 (未全員同意前不可翻牌)`
            : status === "locked"
            ? "全員已同意鎖定！點擊自己的牌翻開"
            : "中央預留牌陣"}
        </span>
      </div>

      {/* 盤面槽位 (固定容量) */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-2xl min-h-[140px]">
        {/* 已打出的卡牌 */}
        {sortedBoard.map((item) => (
          <BoardSlot
            key={item.slotId}
            slotId={item.slotId}
            card={item}
            status={status}
            isCurrentPlayer={item.playerId === currentConnectionId}
            onRecall={onRecallCard}
            onFlip={onFlipCard}
          />
        ))}

        {/* 預留的空席位槽 */}
        {Array.from({ length: emptySlotsCount }).map((_, idx) => (
          <BoardSlot
            key={`empty-slot-${idx}`}
            slotId={`empty-${idx}`}
            status={status}
            isCurrentPlayer={false}
          />
        ))}
      </div>
    </div>
  );
}
