"use client";

import React, { useState } from "react";
import { Terminal, Cpu, ArrowRight, Dices, Eye, EyeOff } from "lucide-react";
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
    <div className="w-full flex-1 min-h-[260px] sm:min-h-[300px] md:min-h-[360px] bg-[#030609]/95 border-2 border-[#00ff9d]/40 p-2 sm:p-4 relative flex flex-col items-center justify-between my-2 font-mono shadow-[0_0_25px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* 頂部四角裝飾錨點 */}
      <div className="absolute top-1 left-1 text-[9px] text-[#00ff9d]/40 pointer-events-none">+</div>
      <div className="absolute top-1 right-1 text-[9px] text-[#00ff9d]/40 pointer-events-none">+</div>
      <div className="absolute bottom-1 left-1 text-[9px] text-[#00ff9d]/40 pointer-events-none">+</div>
      <div className="absolute bottom-1 right-1 text-[9px] text-[#00ff9d]/40 pointer-events-none">+</div>

      {/* 結算完成提示列 */}
      {status === "finished" && (
        <div className="relative z-20 w-full mb-1.5 p-1.5 bg-[#00ff9d]/15 border border-[#00ff9d] flex items-center justify-between text-xs text-[#00ff9d] animate-fade-in font-bold">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#00ff9d] animate-pulse" />
            <span>SYS://MEM_SCAN_COMPLETE (檢視資料節點數值與順序)</span>
          </div>
        </div>
      )}

      {/* 頂部狀態列 */}
      <div className="relative z-10 w-full flex items-center justify-between px-1 py-1 text-xs border-b border-[#00ff9d]/20 pb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#00ff9d] text-[11px] sm:text-xs">
          <Terminal className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>
            MEM_ALLOC: {board.length} / {totalSlotsCount} NODES (MAX: {totalSlotsCount})
          </span>
        </div>

        {/* 主題收合時的展開快捷按鈕 */}
        <div className="flex items-center gap-2">
          {showTopicSetting && isTopicCollapsed && (
            <button
              onClick={() => setIsTopicCollapsed(false)}
              className="flex items-center gap-1 text-[10px] text-[#00e5ff] bg-black/80 hover:bg-[#00e5ff]/20 px-2 py-0.5 border border-[#00e5ff]/50 transition-all cursor-pointer active:scale-95"
            >
              <Eye className="w-3 h-3 text-[#00e5ff]" />
              <span>[EXPAND_BENCHMARK: {topic?.title || "CLASSIC"}]</span>
            </button>
          )}
          <div className="text-[10px] text-[#00ff9d]/50 hidden md:block">
            &gt; SELECT_NODE_TO_INSERT_OR_RECALL
          </div>
        </div>
      </div>

      {/* 基準測試協定橫幅 (Benchmark Query) */}
      {showTopicSetting && !isTopicCollapsed && (
        <div className="relative z-10 w-full max-w-xl bg-[#04080e] border border-[#00e5ff]/60 p-2 sm:p-2.5 my-1 text-center flex flex-col items-center shadow-[0_0_15px_rgba(0,229,255,0.15)] animate-fade-in">
          <div className="flex items-center justify-between w-full mb-1 border-b border-[#00e5ff]/20 pb-1">
            <div className="flex items-center gap-1.5 text-[10px] text-[#00e5ff] font-bold">
              <span className="w-1.5 h-1.5 bg-[#00e5ff] animate-ping" />
              <span>[ PROTOCOL_BENCHMARK ]</span>
            </div>

            <div className="flex items-center gap-1.5">
              {isHost && onRandomTopic && status === "waiting" && (
                <button
                  onClick={onRandomTopic}
                  className="flex items-center gap-1 text-[10px] text-[#ffb000] hover:bg-[#ffb000]/20 px-2 py-0.5 border border-[#ffb000]/50 transition-all cursor-pointer active:scale-95"
                >
                  <Dices className="w-3 h-3" />
                  <span>[REROLL_QUERY]</span>
                </button>
              )}

              <button
                onClick={() => setIsTopicCollapsed(true)}
                title="最小化測試協定"
                className="flex items-center gap-1 text-[10px] text-[#00ff9d]/70 hover:text-[#00ff9d] hover:bg-[#00ff9d]/20 px-2 py-0.5 border border-[#00ff9d]/40 transition-all cursor-pointer active:scale-95"
              >
                <EyeOff className="w-3 h-3" />
                <span>[HIDE]</span>
              </button>
            </div>
          </div>

          <h3 className="text-sm sm:text-base font-black text-[#ffffff] tracking-wider my-0.5 drop-shadow-[0_0_6px_#00e5ff]">
            &gt; {topic?.title || "SYS://BENCHMARK_ALPHA"}
          </h3>

          {/* 兩端極限標尺刻度 */}
          <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-[#00e5ff]/20 text-[10px] sm:text-[11px]">
            <span className="text-[#00e5ff] font-bold truncate max-w-[45%] text-left">
              [001: {topic?.minLabel || "MIN_LIMIT"}]
            </span>

            <div className="flex items-center gap-1 text-[9px] text-[#00ff9d]/60 shrink-0 px-1 font-mono">
              <span>SYNC_GRADIENT</span>
              <ArrowRight className="w-2.5 h-2.5 text-[#00ff9d]" />
            </div>

            <span className="text-[#00e5ff] font-bold truncate max-w-[45%] text-right">
              [{topic?.maxLabel || "MAX_LIMIT"} :100]
            </span>
          </div>
        </div>
      )}

      {/* 盤面記憶體節點 (每列 4 槽位) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full gap-2 sm:gap-3 min-h-[140px] my-auto">
        {slotRows.map((rowSlotIndexes, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="flex items-center justify-center gap-1.5 sm:gap-3 w-full flex-wrap py-0.5"
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
