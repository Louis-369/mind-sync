"use client";

import React from "react";
import { Sparkles, Trophy, ArrowRight, Dices } from "lucide-react";
import { BoardSlot } from "./BoardSlot";
import { BoardCard, TopicItem } from "../../types/game";
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
  topic?: TopicItem;
  presenceSlotsMap?: Record<string, string[]>;
  isHost?: boolean;
  activePlayerIds?: Set<string>;
  onRestart?: () => void;
  onRandomTopic?: () => void;
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
  topic,
  presenceSlotsMap = {},
  isHost = false,
  activePlayerIds,
  onRestart,
  onRandomTopic,
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

      {/* 本局價值主題卷軸 (Topic Scroll Banner) */}
      <div className="relative z-10 w-full max-w-xl topic-scroll-banner rounded-2xl p-2.5 my-1 text-center flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-ukiyo-gold font-serif font-bold">
            <span className="w-2 h-2 rounded-full bg-ukiyo-gold animate-pulse" />
            <span>價值天秤主題</span>
          </div>

          {isHost && onRandomTopic && status === "waiting" && (
            <button
              onClick={onRandomTopic}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-ukiyo-gold hover:text-ukiyo-foam bg-ukiyo-gold/15 hover:bg-ukiyo-gold/25 px-2.5 py-0.5 rounded-full border border-ukiyo-gold/40 transition-all font-serif cursor-pointer active:scale-95"
            >
              <Dices className="w-3 h-3" />
              <span>抽籤換題</span>
            </button>
          )}
        </div>

        <h3 className="text-sm sm:text-base md:text-lg font-serif font-black text-ukiyo-foam tracking-wider my-0.5 drop-shadow">
          {topic?.title || "純數字心流默契"}
        </h3>

        {/* 標尺兩端極端標籤 */}
        <div className="flex items-center justify-between w-full mt-1.5 pt-1.5 border-t border-ukiyo-foam/10 text-[10px] sm:text-xs font-serif">
          <span className="text-ukiyo-gold/90 font-bold truncate max-w-[45%] text-left">
            1 ‧ {topic?.minLabel || "極小值"}
          </span>

          <div className="flex items-center gap-1 text-[9px] text-ukiyo-mist shrink-0 px-1 font-mono">
            <span>默契遞增</span>
            <ArrowRight className="w-2.5 h-2.5 text-ukiyo-gold" />
          </div>

          <span className="text-ukiyo-gold/90 font-bold truncate max-w-[45%] text-right">
            {topic?.maxLabel || "極大值"} ‧ 100
          </span>
        </div>
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
                    focusedByNames={presenceSlotsMap[slotKey] || []}
                    isHost={isHost}
                    activePlayerIds={activePlayerIds}
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
