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
  lockedList?: string[];
  onSelectSlot?: (slotId: string) => void;
  onRecallCard?: (slotId: string) => void;
  onFlipCard?: (slotId: string) => void;
}

export function GameBoard({
  board,
  currentConnectionId,
  status,
  totalPlayers = 2,
  cardsPerPlayer = 2,
  lockedList = [],
  onSelectSlot,
  onRecallCard,
  onFlipCard,
}: GameBoardProps) {
  // 計算本局總共預計發出的卡牌總數 (精確等於發牌總數)
  const totalSlotsCount = totalPlayers * cardsPerPlayer;

  // 根據 slotId 或是放置順序將卡牌歸類至各槽位
  const slotsMap: Record<string, (BoardCard & { slotId: string })[]> = {};
  for (let i = 0; i < totalSlotsCount; i++) {
    slotsMap[`slot-${i}`] = [];
  }

  // 將已經放置在盤面上的卡牌配對至槽位 (按放置時間順序排序，確保無死角渲染)
  const sortedBoard = [...board].sort((a, b) => a.placedAt - b.placedAt);
  sortedBoard.forEach((item, idx) => {
    // 優先匹配 item.slotId，若無則依序歸類到 slot-${idx % totalSlotsCount}
    const targetKey = item.slotId && slotsMap[item.slotId] ? item.slotId : `slot-${idx % totalSlotsCount}`;
    if (slotsMap[targetKey]) {
      slotsMap[targetKey].push(item);
    } else {
      slotsMap[`slot-${idx % totalSlotsCount}`].push(item);
    }
  });

  return (
    <div className="w-full flex-1 min-h-[320px] md:min-h-[380px] bg-gradient-to-b from-ukiyo-surface/90 via-ukiyo-bg/95 to-ukiyo-surface/90 rounded-3xl p-4 md:p-6 border border-ukiyo-foam/15 shadow-2xl relative flex flex-col items-center justify-between overflow-hidden my-2">
      {/* 背景水墨波浪浮水印 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-ukiyo-foam flex items-center justify-center">
          <span className="text-8xl font-serif text-ukiyo-foam">心</span>
        </div>
      </div>

      {/* 頂部狀態與說明 */}
      <div className="relative z-10 text-center">
        <span className="text-xs tracking-widest text-ukiyo-gold font-serif font-bold bg-ukiyo-bg/60 px-3 py-1 rounded-full border border-ukiyo-foam/10">
          {status === "playing"
            ? `已落牌 ${board.length} / ${totalSlotsCount} 張 (未全員同意前不可翻牌)`
            : status === "locked"
            ? "全員已同意鎖定！點擊自己的牌翻開"
            : "中央預留牌陣"}
        </span>
      </div>

      {/* 由小到大 順序視覺引導軸 */}
      <div className="relative z-10 w-full max-w-xl flex items-center justify-between px-2 my-2 text-[11px] font-serif text-ukiyo-mist">
        <div className="flex items-center space-x-1 bg-ukiyo-bg/80 px-2.5 py-0.5 rounded border border-ukiyo-foam/10">
          <span className="text-ukiyo-gold font-bold">小</span>
          <span className="text-[10px] font-mono opacity-60">(1)</span>
        </div>
        <div className="flex-1 mx-3 flex items-center justify-center space-x-2">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-ukiyo-gold/40 via-ukiyo-foam/20 to-ukiyo-gold/40" />
          <span className="text-[10px] text-ukiyo-gold/80 tracking-widest uppercase">放置順序 ➔</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-ukiyo-gold/40 via-ukiyo-foam/20 to-ukiyo-gold/40" />
        </div>
        <div className="flex items-center space-x-1 bg-ukiyo-bg/80 px-2.5 py-0.5 rounded border border-ukiyo-foam/10">
          <span className="text-ukiyo-gold font-bold">大</span>
          <span className="text-[10px] font-mono opacity-60">(100)</span>
        </div>
      </div>

      {/* 盤面槽位 (精確容量) */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-2xl min-h-[140px] my-auto">
        {Array.from({ length: totalSlotsCount }).map((_, idx) => {
          const slotKey = `slot-${idx}`;
          const slotCards = slotsMap[slotKey] || [];
          const topCard = slotCards[slotCards.length - 1];

          return (
            <BoardSlot
              key={slotKey}
              slotId={slotKey}
              cards={slotCards}
              status={status}
              isOwnerLocked={topCard ? lockedList.includes(topCard.playerId) : false}
              isCurrentPlayer={topCard ? topCard.playerId === currentConnectionId : false}
              onSelectSlot={onSelectSlot}
              onRecall={onRecallCard}
              onFlip={onFlipCard}
            />
          );
        })}
      </div>
    </div>
  );
}
