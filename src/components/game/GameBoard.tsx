"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { BoardSlot } from "./BoardSlot";
import { BoardCard } from "../../types/game";

interface GameBoardProps {
  board: BoardCard[];
  currentConnectionId: string;
  status: string;
  totalPlayers?: number;
  cardsPerPlayer?: number;
  lockedList?: string[];
  selectedSlotId?: string | null;
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
  selectedSlotId,
  onSelectSlot,
  onRecallCard,
  onFlipCard,
}: GameBoardProps) {
  // 計算本局總共預計發出的卡牌總數 (全場最大上限 12 個席位)
  const totalSlotsCount = Math.min(12, totalPlayers * cardsPerPlayer);

  // 根據 slotId 或是放置順序將卡牌歸類至各槽位
  const slotsMap: Record<string, BoardCard[]> = {};
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

  // 即時計算所有已翻開卡牌各席位卡牌順序正確性 (1對1與正確排序比對)
  const slotCorrectnessMap: Record<string, boolean> = {};
  const flippedSlots: { slotKey: string; slotIdx: number; val: number }[] = [];

  for (let i = 0; i < totalSlotsCount; i++) {
    const key = `slot-${i}`;
    const cards = slotsMap[key] || [];
    const topCard = cards[cards.length - 1];
    if (topCard && topCard.flipped) {
      flippedSlots.push({ slotKey: key, slotIdx: i, val: topCard.cardValue });
    }
  }

  if (flippedSlots.length > 0) {
    // 依據卡牌數值由小到大正確排序
    const sortedCards = [...flippedSlots].sort((a, b) => a.val - b.val);

    // 依據當前席位順序與正確排序進行 1 對 1 位置比對
    flippedSlots.forEach((slot, idx) => {
      const expectedVal = sortedCards[idx].val;
      slotCorrectnessMap[slot.slotKey] = slot.val === expectedVal;
    });
  }

  // 檢查全場卡牌是否已全部翻開 (全數翻開或 status === "finished" 才開啟微光與錯誤標籤)
  const isAllCardsFlipped = board.length > 0 && board.every((c) => c.flipped);
  const isFinishedReveal = status === "finished" || isAllCardsFlipped;

  return (
    <div className="w-full flex-1 min-h-[320px] md:min-h-[380px] bg-gradient-to-b from-ukiyo-surface/90 via-ukiyo-bg/95 to-ukiyo-surface/90 rounded-3xl p-2.5 md:p-6 border border-ukiyo-foam/20 shadow-2xl relative flex flex-col items-center justify-between overflow-hidden my-2 washi-texture">
      {/* 背景水墨波浪浮水印 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-ukiyo-foam flex items-center justify-center">
          <span className="text-8xl font-serif text-ukiyo-foam">心</span>
        </div>
      </div>

      {/* 頂部說明引導與計數器 */}
      <div className="relative z-10 w-full flex items-center justify-between px-2 py-1 text-xs text-ukiyo-mist font-serif border-b border-ukiyo-foam/10 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-ukiyo-foam">
          <Sparkles className="w-3.5 h-3.5 text-ukiyo-gold" />
          <span>
            已落牌 {board.length} / {totalSlotsCount} 張 (點擊席位選位 ➔ 點擊手牌落牌)
          </span>
        </div>

        {/* 右側多排順序指示 */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-ukiyo-gold font-mono">
          <span>由上至下、由左至右 ➔ 由小到大</span>
          <span className="text-[10px] font-mono opacity-60">(100)</span>
        </div>
      </div>

      {/* 盤面槽位 (4 個與 4 個以下強制作 flex-nowrap 絕不折行，超過 4 個自動折行) */}
      <div
        className={`relative z-10 flex items-center justify-center w-full max-w-full gap-1 sm:gap-2.5 md:gap-4 min-h-[140px] my-auto ${
          totalSlotsCount <= 4 ? "flex-nowrap" : "flex-wrap"
        }`}
      >
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
              currentConnectionId={currentConnectionId}
              isSelected={selectedSlotId === slotKey}
              isCorrectOrder={slotCorrectnessMap[slotKey]}
              isFinishedReveal={isFinishedReveal}
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
