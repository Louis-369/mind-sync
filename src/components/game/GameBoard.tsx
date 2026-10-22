"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, ArrowRight, Dices, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
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
  selectedHandCard?: number | null;
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
  selectedHandCard = null,
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

  // 計算翻牌階段的「即時安全水位線」
  const flippedCardsInOrder: { slotIndex: number; val: number; name: string }[] = [];
  for (let i = 0; i < totalSlotsCount; i++) {
    const cards = slotsMap[`slot-${i}`] || [];
    const top = cards[cards.length - 1];
    if (top && top.flipped) {
      flippedCardsInOrder.push({ slotIndex: i + 1, val: top.cardValue, name: top.playerName });
    }
  }

  let currentSafeThreshold = 0;
  let hasInversion = false;
  let inversionInfo = { prevVal: 0, nextVal: 0, slotIdx: 0 };

  for (let i = 0; i < flippedCardsInOrder.length; i++) {
    const curr = flippedCardsInOrder[i];
    if (i > 0) {
      const prev = flippedCardsInOrder[i - 1];
      if (curr.val < prev.val) {
        hasInversion = true;
        inversionInfo = { prevVal: prev.val, nextVal: curr.val, slotIdx: curr.slotIndex };
        break;
      }
    }
    currentSafeThreshold = Math.max(currentSafeThreshold, curr.val);
  }

  return (
    <div className="w-full flex-1 min-h-[260px] sm:min-h-[300px] md:min-h-[360px] bg-[#ffffff] border-2 border-[#18181b] rounded-2xl p-3 sm:p-5 relative flex flex-col items-center justify-between my-2 shadow-[4px_4px_0px_#18181b] overflow-hidden">
      {/* 結算完成提示列 */}
      {status === "finished" && (
        <div className="relative z-20 w-full mb-2 p-2.5 rounded-xl bg-[#fef3c7] border-2 border-[#18181b] flex items-center justify-between text-xs text-[#18181b] animate-fade-in font-black shadow-[2px_2px_0px_#18181b]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#f59e0b] animate-bounce" />
            <span>對局已完成！全部數字已揭曉驗證。</span>
          </div>
        </div>
      )}

      {/* 頂部狀態列 */}
      <div className="relative z-10 w-full flex items-center justify-between px-1 py-1 text-xs border-b-2 border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 font-black text-[#18181b] text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-[#f59e0b]" />
          <span>
            已出牌 {board.length} / {totalSlotsCount} 張
          </span>
        </div>

        {/* 主題收合時的展開快捷按鈕 */}
        <div className="flex items-center gap-2">
          {showTopicSetting && isTopicCollapsed && (
            <button
              onClick={() => setIsTopicCollapsed(false)}
              className="flex items-center gap-1 text-[11px] font-black text-[#18181b] bg-[#f4f1ea] hover:bg-[#e7e1d5] px-2.5 py-1 rounded-lg border-2 border-[#18181b] transition-all cursor-pointer shadow-[2px_2px_0px_#18181b] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <Eye className="w-3 h-3 text-[#f59e0b]" />
              <span>題目：《{topic?.title || "數字排序"}》</span>
            </button>
          )}
          <div className="text-[11px] text-slate-500 font-bold hidden md:block">
            {selectedHandCard !== null ? `👉 點擊空位即可放入【${selectedHandCard}】` : "先選牌或先選位皆可"}
          </div>
        </div>
      </div>

      {/* 本局主題天秤橫樑 */}
      {showTopicSetting && !isTopicCollapsed && (
        <div className="relative z-10 w-full max-w-xl topic-scroll-banner p-3 my-1.5 text-center flex flex-col items-center animate-fade-in">
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 text-xs text-[#18181b] font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-[#18181b]" />
              <span>本局題目</span>
            </div>

            <div className="flex items-center gap-2">
              {isHost && onRandomTopic && status === "waiting" && (
                <button
                  onClick={onRandomTopic}
                  className="flex items-center gap-1 text-[11px] font-black text-[#18181b] bg-[#fef3c7] hover:bg-[#fde68a] px-2.5 py-1 rounded-lg border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>換題</span>
                </button>
              )}

              <button
                onClick={() => setIsTopicCollapsed(true)}
                title="隱藏題目"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-black bg-[#f4f1ea] px-2 py-1 rounded-lg border border-slate-300 transition-all cursor-pointer"
              >
                <EyeOff className="w-3 h-3" />
                <span>收合</span>
              </button>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-black text-[#18181b] tracking-wide my-1">
            {topic?.title || "純數字默契挑戰"}
          </h3>

          {/* 兩端極限標尺 (冷暖色帶) */}
          <div className="flex items-center justify-between w-full mt-1.5 pt-1.5 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e0f2fe] text-[#0284c7] font-black border border-[#0284c7]/30 max-w-[45%] truncate">
              <span>❄️ 1</span>
              <span className="truncate">{topic?.minLabel || "最小"}</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-black shrink-0 px-2">
              <span>由小到大</span>
              <ArrowRight className="w-3 h-3 text-[#f59e0b]" />
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fee2e2] text-[#dc2626] font-black border border-[#dc2626]/30 max-w-[45%] truncate">
              <span className="truncate">{topic?.maxLabel || "最大"}</span>
              <span>100 🔥</span>
            </div>
          </div>
        </div>
      )}

      {/* 翻牌階段即時安全水位線 (Threshold Bar) */}
      {status === "locked" && (
        <div className="relative z-10 w-full max-w-xl my-1 p-2.5 rounded-xl border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] animate-fade-in font-mono text-xs flex items-center justify-between transition-all bg-[#ffffff]">
          {hasInversion ? (
            <div className="flex items-center gap-2 text-[#ef4444] font-black w-full">
              <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>
                順序爆掉啦！第 {inversionInfo.slotIdx} 格【 {inversionInfo.nextVal} 】比前一張【 {inversionInfo.prevVal} 】還要小！
              </span>
            </div>
          ) : flippedCardsInOrder.length === 0 ? (
            <div className="flex items-center gap-2 text-[#18181b] font-black w-full">
              <ShieldCheck className="w-4 h-4 text-[#0ea5e9] shrink-0" />
              <span>翻牌開始！請點擊最有把握的格子翻開驗證</span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-[#10b981] font-black">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  目前安全水位：<span className="text-base text-[#18181b] bg-[#fef3c7] px-2 py-0.5 rounded border border-[#18181b]">{currentSafeThreshold}</span>
                </span>
              </div>
              <span className="text-[#18181b] font-bold text-[11px] bg-[#f4f1ea] px-2 py-0.5 rounded border border-slate-300">
                下一張必須 ≥ {currentSafeThreshold}
              </span>
            </div>
          )}
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
                  totalSlotsCount={totalSlotsCount}
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
                  selectedHandCard={selectedHandCard}
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
