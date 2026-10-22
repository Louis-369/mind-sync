"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, ArrowRight, Dices, Eye, EyeOff } from "lucide-react";
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
  showTopicSetting?: boolean;
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
  showTopicSetting = true,
  presenceSlotsMap = {},
  isHost = false,
  activePlayerIds,
  onRestart,
  onRandomTopic,
  onSelectSlot,
  onRecallCard,
  onFlipCard,
}: GameBoardProps) {
  const [isTopicCollapsed, setIsTopicCollapsed] = useState<boolean>(false);

  const { totalSlotsCount, slotsMap, slotCorrectnessMap, isFinishedReveal } = useBoardState(
    board,
    totalPlayers,
    cardsPerPlayer,
    status
  );

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
    <div className="w-full flex-1 min-h-[260px] sm:min-h-[300px] md:min-h-[360px] bg-[#12161f] border border-slate-700 rounded-xl p-3 sm:p-5 relative flex flex-col items-center justify-between my-2 shadow-2xl overflow-hidden">
      {/* 結算完成提示列 */}
      {status === "finished" && (
        <div className="relative z-20 w-full mb-2 p-2 rounded-lg bg-slate-800 border border-[#f59e0b]/50 flex items-center justify-between text-xs text-[#f59e0b] animate-fade-in font-bold">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#f59e0b] animate-bounce" />
            <span>盤面檢視模式（點數與順序已全數揭曉）</span>
          </div>
        </div>
      )}

      {/* 頂部狀態列 */}
      <div className="relative z-10 w-full flex items-center justify-between px-1 py-1 text-xs border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-white text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>
            已落牌 {board.length} / {totalSlotsCount} 張 (共 {totalSlotsCount} 席)
          </span>
        </div>

        {/* 主題收合時的展開快捷按鈕 */}
        <div className="flex items-center gap-2">
          {showTopicSetting && isTopicCollapsed && (
            <button
              onClick={() => setIsTopicCollapsed(false)}
              className="flex items-center gap-1 text-[11px] text-[#f59e0b] bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded border border-[#f59e0b]/40 transition-all cursor-pointer active:scale-95 font-medium"
            >
              <Eye className="w-3 h-3 text-[#f59e0b]" />
              <span>展開主題：《{topic?.title || "經典心流"}》</span>
            </button>
          )}
          <div className="text-[11px] text-slate-400 hidden md:block">
            點選空席位落牌，點擊已出卡牌可收回
          </div>
        </div>
      </div>

      {/* 本局價值主題橫幅 */}
      {showTopicSetting && !isTopicCollapsed && (
        <div className="relative z-10 w-full max-w-xl topic-scroll-banner p-3 my-1.5 text-center flex flex-col items-center animate-fade-in">
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 text-xs text-[#f59e0b] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
              <span>本局主題</span>
            </div>

            <div className="flex items-center gap-2">
              {isHost && onRandomTopic && status === "waiting" && (
                <button
                  onClick={onRandomTopic}
                  className="flex items-center gap-1 text-[11px] text-[#f59e0b] bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 px-2.5 py-0.5 rounded border border-[#f59e0b]/40 transition-all cursor-pointer active:scale-95"
                >
                  <Dices className="w-3 h-3" />
                  <span>抽籤換題</span>
                </button>
              )}

              <button
                onClick={() => setIsTopicCollapsed(true)}
                title="隱藏主題以獲取更大牌桌視野"
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-all cursor-pointer active:scale-95"
              >
                <EyeOff className="w-3 h-3" />
                <span>隱藏主題</span>
              </button>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide my-1">
            {topic?.title || "純數字心流默契"}
          </h3>

          {/* 兩端極限標尺 */}
          <div className="flex items-center justify-between w-full mt-1.5 pt-1.5 border-t border-slate-800 text-xs">
            <span className="text-[#f59e0b] font-bold truncate max-w-[45%] text-left">
              1 ‧ {topic?.minLabel || "極小值"}
            </span>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 px-1 font-mono">
              <span>默契遞增</span>
              <ArrowRight className="w-2.5 h-2.5 text-[#f59e0b]" />
            </div>

            <span className="text-[#f59e0b] font-bold truncate max-w-[45%] text-right">
              {topic?.maxLabel || "極大值"} ‧ 100
            </span>
          </div>
        </div>
      )}

      {/* 盤面槽位 (每列 4 槽位) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full gap-2 sm:gap-3 min-h-[140px] my-auto">
        {slotRows.map((rowSlotIndexes, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex items-center justify-center gap-2 sm:gap-4 w-full flex-wrap py-1"
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
                  onRecallCard={onRecallCard}
                  onFlipCard={onFlipCard}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
