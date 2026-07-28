"use client";

import React from "react";
import { Sparkles, RotateCcw, Trophy } from "lucide-react";
import { BoardSlot } from "./BoardSlot";
import { BoardCard } from "../../types/game";
import { Button } from "../ui/Button";

interface GameBoardProps {
  board: BoardCard[];
  currentConnectionId: string;
  currentPlayerId?: string;
  status: string;
  totalPlayers?: number;
  cardsPerPlayer?: number;
  lockedList?: string[];
  selectedSlotId?: string | null;
  isHost?: boolean;
  onRestart?: () => void;
  onSelectSlot?: (slotId: string) => void;
  onRecallCard?: (slotId: string) => void;
  onFlipCard?: (slotId: string) => void;
}

export function GameBoard({
  board,
  currentConnectionId,
  currentPlayerId,
  status,
  totalPlayers = 2,
  cardsPerPlayer = 2,
  lockedList = [],
  selectedSlotId,
  isHost = false,
  onRestart,
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

  // 每 4 個槽位分一組 (Row)，強制單行上限絕不超過 4 個，且每一行皆獨自信仰水平置中
  const slotRows: number[][] = [];
  for (let i = 0; i < totalSlotsCount; i += 4) {
    const row: number[] = [];
    for (let j = i; j < Math.min(i + 4, totalSlotsCount); j++) {
      row.push(j);
    }
    slotRows.push(row);
  }

  return (
    <div className="w-full flex-1 min-h-[320px] md:min-h-[380px] bg-gradient-to-b from-ukiyo-surface/90 via-ukiyo-bg/95 to-ukiyo-surface/90 rounded-3xl p-2.5 md:p-6 border border-ukiyo-foam/20 shadow-2xl relative flex flex-col items-center justify-between overflow-hidden my-2 washi-texture">
      {/* 背景水墨波浪浮水印 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-ukiyo-foam flex items-center justify-center">
          <span className="text-8xl font-serif text-ukiyo-foam">心</span>
        </div>
      </div>

      {/* 遊戲結束顯眼狀態橫條 */}
      {status === "finished" && (
        <div className="relative z-20 w-full mb-2 p-2 rounded-xl bg-ukiyo-surface/95 border border-ukiyo-gold/40 shadow-lg flex items-center justify-between text-xs font-serif animate-fade-in">
          <div className="flex items-center gap-1.5 text-ukiyo-gold font-bold">
            <Trophy className="w-4 h-4 text-ukiyo-gold animate-bounce" />
            <span>盤面檢視模式（可使用下方列查看結算卡或重開局）</span>
          </div>
        </div>
      )}

      {/* 頂部說明引導與計數器 */}
      <div className="relative z-10 w-full flex items-center justify-between px-2 py-1 text-xs text-ukiyo-mist font-serif border-b border-ukiyo-foam/10 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-ukiyo-foam text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-ukiyo-gold" />
          <span>
            已落牌 {board.length} / {totalSlotsCount} 張 (點擊席位選位 ➔ 點擊手牌落牌)
          </span>
        </div>

        {/* 右側多排順序指示 (手機與桌機皆可見) */}
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-ukiyo-gold font-mono whitespace-nowrap">
          <span>由左至右 ➔ 由小到大</span>
        </div>
      </div>

      {/* 盤面槽位 (4 個一組分組演算法：單行上限嚴格固定最多 4 個，每一行皆獨立彈性水平置中) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full gap-2 sm:gap-3 md:gap-4 min-h-[140px] my-auto">
        {slotRows.map((rowSlotIndexes, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex items-center justify-center gap-1 sm:gap-2.5 md:gap-4 w-full flex-nowrap"
          >
            {rowSlotIndexes.map((idx) => {
              const slotKey = `slot-${idx}`;
              const slotCards = slotsMap[slotKey] || [];
              const topCard = slotCards[slotCards.length - 1];

              return (
                <BoardSlot
                  key={slotKey}
                  slotId={slotKey}
                  cards={slotCards}
                  status={status}
                  isOwnerLocked={
                    topCard
                      ? lockedList.includes(topCard.playerId) ||
                        Boolean((topCard as any).connectionId && lockedList.includes((topCard as any).connectionId))
                      : false
                  }
                  isCurrentPlayer={
                    topCard
                      ? (currentPlayerId && topCard.playerId === currentPlayerId) ||
                        topCard.playerId === currentConnectionId ||
                        (topCard as any).connectionId === currentConnectionId
                      : false
                  }
                  currentConnectionId={currentConnectionId}
                  currentPlayerId={currentPlayerId}
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
        ))}
      </div>
    </div>
  );
}
