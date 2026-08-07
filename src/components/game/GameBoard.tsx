"use client";

import React from "react";
import { Sparkles, Trophy, ArrowRight } from "lucide-react";
import { BoardSlot } from "./BoardSlot";
import { BoardCard } from "../../types/game";
import { useBoardState } from "../../hooks/useBoardState";

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
  const { totalSlotsCount, slotsMap, slotCorrectnessMap, isFinishedReveal } = useBoardState(
    board,
    totalPlayers,
    cardsPerPlayer,
    status
  );

  // 每列嚴格固定 4 個席位 (4-column grid layout)，確保手機端全卡牌一目瞭然，免除橫向滾動看牌
  const maxPerRow = 4;

  const slotRows: number[][] = [];
  for (let i = 0; i < totalSlotsCount; i += maxPerRow) {
    const row: number[] = [];
    for (let j = i; j < Math.min(i + maxPerRow, totalSlotsCount); j++) {
      row.push(j);
    }
    slotRows.push(row);
  }

  return (
    <div className="w-full flex-1 min-h-[260px] sm:min-h-[300px] md:min-h-[360px] bg-gradient-to-b from-ukiyo-surface/95 via-ukiyo-bg/95 to-ukiyo-surface/95 rounded-2xl md:rounded-3xl p-2.5 md:p-5 border border-ukiyo-gold/30 shadow-2xl relative flex flex-col items-center justify-between my-2 washi-texture overflow-hidden">
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

      {/* 極簡典雅 [ 最小卡牌 ➔ 由左至右 ‧ 由上至下遞增 ➔ 最大卡牌 ] 順序流向引導橫條 */}
      <div className="relative z-10 w-full max-w-xl flex items-center justify-between px-3 py-1.5 my-1.5 rounded-xl bg-ukiyo-bg/80 border border-ukiyo-gold/30 shadow-sm text-xs font-serif">
        <span className="text-ukiyo-gold font-bold text-[10px] sm:text-xs">
          最小卡牌
        </span>

        <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-ukiyo-foam/90 font-serif tracking-wider">
          <span>由左至右 ‧ 由上至下遞增</span>
          <ArrowRight className="w-3 h-3 text-ukiyo-gold shrink-0" />
        </div>

        <span className="text-ukiyo-gold font-bold text-[10px] sm:text-xs">
          最大卡牌
        </span>
      </div>

      {/* 盤面槽位 (席位精準動態排版：每列固定 4 個席位，手機屏一次全覽免橫滾) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full gap-2 sm:gap-3 md:gap-4 min-h-[140px] my-auto">
        {slotRows.map((rowSlotIndexes, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 w-full flex-wrap py-1"
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
                    lockedList={lockedList}
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
