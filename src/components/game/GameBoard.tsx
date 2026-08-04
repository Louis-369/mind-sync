"use client";

import React from "react";
import { Sparkles, Trophy, ArrowRight } from "lucide-react";
import { BoardSlot } from "./BoardSlot";
import { BoardCard } from "../../types/game";

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
  // 動態精準計算本局所需席位總數 (2人4張=4席；3人6張=6席；不渲染無用虛包)
  const totalSlotsCount = Math.min(12, Math.max(2, totalPlayers * cardsPerPlayer));

  // 根據 slotId 或是放置順序將卡牌歸類至各槽位
  const slotsMap: Record<string, BoardCard[]> = {};
  for (let i = 0; i < totalSlotsCount; i++) {
    slotsMap[`slot-${i}`] = [];
  }

  // 將已經放置在盤面上的卡牌配對至槽位 (按放置時間順序排序)
  const sortedBoard = [...board].sort((a, b) => a.placedAt - b.placedAt);
  sortedBoard.forEach((item, idx) => {
    const targetKey = item.slotId && slotsMap[item.slotId] ? item.slotId : `slot-${idx % totalSlotsCount}`;
    if (slotsMap[targetKey]) {
      slotsMap[targetKey].push(item);
    } else {
      slotsMap[`slot-${idx % totalSlotsCount}`].push(item);
    }
  });

  // 即時計算所有已翻開卡牌各席位卡牌順序正確性
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
    const sortedCards = [...flippedSlots].sort((a, b) => a.val - b.val);
    flippedSlots.forEach((slot, idx) => {
      const expectedVal = sortedCards[idx].val;
      slotCorrectnessMap[slot.slotKey] = slot.val === expectedVal;
    });
  }

  // 檢查全場卡牌是否已全部翻開
  const isAllCardsFlipped = board.length > 0 && board.every((c) => c.flipped);
  const isFinishedReveal = status === "finished" || isAllCardsFlipped;

  // 席位佈局分行演算法：6 席以下優先呈現為彈性單行橫排 (Single Flow Row)
  const isSingleRowLayout = totalSlotsCount <= 6;
  const maxPerRow = isSingleRowLayout ? totalSlotsCount : 4;

  const slotRows: number[][] = [];
  for (let i = 0; i < totalSlotsCount; i += maxPerRow) {
    const row: number[] = [];
    for (let j = i; j < Math.min(i + maxPerRow, totalSlotsCount); j++) {
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

      {/* 結算狀態橫條 */}
      {status === "finished" && (
        <div className="relative z-20 w-full mb-2 p-2 rounded-xl bg-ukiyo-surface/95 border border-ukiyo-gold/40 shadow-lg flex items-center justify-between text-xs font-serif animate-fade-in">
          <div className="flex items-center gap-1.5 text-ukiyo-gold font-bold">
            <Trophy className="w-4 h-4 text-ukiyo-gold animate-bounce" />
            <span>盤面檢視模式（可查看結算點數與卡牌位置）</span>
          </div>
        </div>
      )}

      {/* 頂部狀態列 */}
      <div className="relative z-10 w-full flex items-center justify-between px-2 py-1 text-xs text-ukiyo-mist font-serif border-b border-ukiyo-foam/10 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-ukiyo-foam text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-ukiyo-gold" />
          <span>
            已落牌 {board.length} / {totalSlotsCount} 張 (共 {totalSlotsCount} 席)
          </span>
        </div>
        <div className="text-[10px] text-ukiyo-mist font-normal hidden md:block">
          💡 點選空席位可預定落牌，點擊已出卡牌可收回
        </div>
      </div>

      {/* 醒目 [ 最小卡牌 ──▶ ──▶ 最大卡牌 ] 順序流向引導橫條 */}
      <div className="relative z-10 w-full max-w-2xl flex items-center justify-between px-3 py-1.5 my-2 rounded-xl bg-ukiyo-surface/80 border border-ukiyo-gold/30 shadow-sm text-xs font-serif">
        <div className="flex items-center gap-1.5 text-ukiyo-gold font-bold text-[11px] sm:text-xs shrink-0">
          <span>［ 🌸 最小卡牌 ］</span>
        </div>

        <div className="flex-1 flex items-center justify-center mx-2 overflow-hidden">
          <div className="w-full border-t border-dashed border-ukiyo-gold/40 relative flex items-center justify-center">
            <span className="bg-ukiyo-surface px-2 text-[10px] sm:text-[11px] font-serif text-ukiyo-foam/90 tracking-wider flex items-center gap-1">
              由左至右 數值遞增 <ArrowRight className="w-3 h-3 text-ukiyo-gold" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-ukiyo-gold font-bold text-[11px] sm:text-xs shrink-0">
          <span>［ 最大卡牌 🌸 ］</span>
        </div>
      </div>

      {/* 盤面槽位 (席位精準動態排版：6 席以下彈性橫向並排，絕無多餘空間浪費) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full gap-2 sm:gap-3 md:gap-4 min-h-[140px] my-auto">
        {slotRows.map((rowSlotIndexes, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 w-full flex-nowrap overflow-x-auto py-1"
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
