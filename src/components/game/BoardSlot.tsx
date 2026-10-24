"use client";

import React from "react";
import { Card } from "../ui/Card";
import { BoardCard } from "../../types/game";
import { sound } from "../../lib/soundEngine";

interface BoardSlotProps {
  slotId: string;
  cards: BoardCard[];
  status: string;
  totalSlotsCount?: number;
  lockedList?: string[];
  isOwnerLocked?: boolean;
  isCurrentPlayer?: boolean;
  currentConnectionId?: string;
  currentPlayerId?: string;
  isSelected?: boolean;
  selectedHandCard?: number | null;
  isCorrectOrder?: boolean;
  isFinishedReveal?: boolean;
  focusedByNames?: string[];
  isHost?: boolean;
  activePlayerIds?: Set<string>;
  onSelectSlot?: (slotId: string) => void;
  onRecall?: (uniqueKey: string) => void;
  onRecallCard?: (slotId: string) => void;
  onFlip?: (uniqueKey: string) => void;
  onFlipCard?: (slotId: string) => void;
}

// 根據槽位在總長度中的比例計算和風光譜色溫
function getSlotSpectrumTheme(index: number, total: number) {
  const ratio = total > 1 ? index / (total - 1) : 0;
  if (ratio <= 0.25) {
    return { name: "極小", icon: "❄️", border: "border-[#0ea5e9]/50", text: "text-[#38bdf8]" };
  }
  if (ratio <= 0.55) {
    return { name: "偏小", icon: "🌿", border: "border-[#10b981]/50", text: "text-[#34d399]" };
  }
  if (ratio <= 0.8) {
    return { name: "偏大", icon: "☀️", border: "border-[#c9a96e]/60", text: "text-[#c9a96e]" };
  }
  return { name: "極大", icon: "🔥", border: "border-[#c73e1d]/70", text: "text-[#ff6b4a]" };
}

export function BoardSlot({
  slotId,
  cards,
  status,
  totalSlotsCount = 4,
  lockedList = [],
  isOwnerLocked = false,
  isCurrentPlayer = false,
  currentConnectionId,
  currentPlayerId,
  isSelected = false,
  selectedHandCard = null,
  isCorrectOrder,
  isFinishedReveal = false,
  focusedByNames = [],
  isHost = false,
  activePlayerIds,
  onSelectSlot,
  onRecall,
  onRecallCard,
  onFlip,
  onFlipCard,
}: BoardSlotProps) {
  const handleRecall = onRecallCard || onRecall;
  const handleFlip = onFlipCard || onFlip;
  const slotIndex = parseInt(slotId.replace("slot-", ""), 10) + 1;
  const slotTheme = getSlotSpectrumTheme(slotIndex - 1, totalSlotsCount);

  const allCards = cards;
  const topCard = allCards[allCards.length - 1];
  const isFlipped = topCard ? topCard.flipped : false;
  const hasCollision = allCards.length > 1;

  const isCardMine = (c: BoardCard) =>
    (currentConnectionId && (c.playerId === currentConnectionId || (c as any).connectionId === currentConnectionId)) ||
    (currentPlayerId && c.playerId === currentPlayerId) ||
    (c.playerId === topCard?.playerId && isCurrentPlayer);

  const myUnflippedCard = allCards.find((c) => isCardMine(c) && !c.flipped);

  const isOwnerOnline = topCard
    ? activePlayerIds
      ? activePlayerIds.has(topCard.playerId) || (Boolean((topCard as any).connectionId) && activePlayerIds.has((topCard as any).connectionId))
      : true
    : false;

  const collisionNamesText = allCards.map((c) => c.playerName).join(" ⚡ ");
  const bottomPlayerNamesText = allCards.map((c) => c.playerName).join(", ");
  const isAnyCardMine = allCards.some((c) => isCardMine(c));

  // 空槽位狀態
  if (allCards.length === 0) {
    const canSelect = status === "playing";
    return (
      <div
        onClick={() => {
          if (canSelect && onSelectSlot) {
            sound.playSlotTap();
            onSelectSlot(slotId);
          }
        }}
        className={`relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 shrink-0 rounded-xl border-2 transition-all flex flex-col items-center justify-between p-1.5 select-none ${
          canSelect
            ? "cursor-pointer hover:border-[#c9a96e] hover:bg-[#c9a96e]/10 active:scale-95"
            : "cursor-default opacity-40"
        } ${
          isSelected
            ? "border-[#c9a96e] bg-[#c9a96e]/20 shadow-[0_0_15px_rgba(201,169,110,0.5)] scale-105"
            : selectedHandCard !== null && canSelect
            ? "border-[#c9a96e] bg-[#162436]/90 border-dashed shadow-[0_0_12px_rgba(201,169,110,0.3)] animate-pulse"
            : "border-dashed border-[rgba(201,169,110,0.3)] bg-[#101c2b]/70 shadow-inner"
        }`}
      >
        {/* 頂部光譜圖標 + 席位標籤 */}
        <div className="w-full flex items-center justify-between text-[10px] font-bold">
          <span title={slotTheme.name}>{slotTheme.icon}</span>
          <span className="text-[#8a9bb0] font-serif">第 {slotIndex} 格</span>
        </div>

        {/* 清楚大字 1, 2, 3, 4 */}
        <div className="text-xl sm:text-2xl font-black text-[#c9a96e]/80 font-mono">
          {slotIndex}
        </div>

        {/* 底部動態標籤 */}
        {isSelected ? (
          <span className="text-[10px] font-bold text-[#c9a96e] tracking-wider animate-bounce">
            放這格
          </span>
        ) : selectedHandCard !== null && canSelect ? (
          <span className="text-[9px] font-bold text-[#38bdf8] truncate max-w-full">
            放入 {selectedHandCard}
          </span>
        ) : focusedByNames.length > 0 ? (
          <span className="text-[9px] text-[#38bdf8] truncate max-w-full">
            {focusedByNames[0]} 想放
          </span>
        ) : (
          <span className="text-[9px] text-[#8a9bb0]/70 font-medium">空位</span>
        )}
      </div>
    );
  }

  // 有卡牌時的點擊事件處理
  const handleCardClick = (clickedCard?: BoardCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const targetCard =
      clickedCard &&
      ((currentConnectionId && clickedCard.playerId === currentConnectionId) ||
        (clickedCard.playerId === topCard?.playerId && isCurrentPlayer))
        ? clickedCard
        : myUnflippedCard;

    // 出牌階段：點擊自己未翻開的牌可收回
    if (targetCard && !targetCard.flipped) {
      if (status === "playing" && !isOwnerLocked && handleRecall) {
        handleRecall(targetCard.uniqueKey || slotId);
        return;
      }
    }

    // 翻牌階段：點擊翻開
    const canFlipNow =
      status === "locked" &&
      topCard &&
      !topCard.flipped &&
      (Boolean(myUnflippedCard) || !isOwnerOnline || Boolean(isHost));

    if (canFlipNow && handleFlip) {
      handleFlip(topCard.uniqueKey || slotId);
      return;
    }

    if (status === "playing" && onSelectSlot) {
      sound.playSlotTap();
      onSelectSlot(slotId);
    }
  };

  const isHighlightSelected = status === "playing" && isSelected;

  return (
    <div
      onClick={(e) => handleCardClick(undefined, e)}
      className="relative flex flex-col items-center pt-3.5 p-1 cursor-pointer touch-manipulation group select-none shrink-0"
    >
      {/* 狀態指示標籤 */}
      {isFinishedReveal && isCorrectOrder === false ? (
        <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-[#c73e1d] text-white font-bold rounded-full whitespace-nowrap shadow-md border border-white animate-ascii-glitch">
          順序錯 ✕
        </span>
      ) : hasCollision ? (
        <div className="absolute top-0 z-30 bg-[#c73e1d] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-lg border border-white animate-bounce">
          ⚡ 撞牌！({collisionNamesText})
        </div>
      ) : status === "locked" && topCard && !topCard?.flipped ? (
        myUnflippedCard ? (
          <span className="absolute top-0 z-30 text-[10px] px-2.5 py-0.5 bg-[#c9a96e] text-[#0d1b2a] font-black rounded-full whitespace-nowrap shadow-lg animate-pulse border border-white">
            點擊翻牌
          </span>
        ) : !isOwnerOnline ? (
          <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-[#38bdf8] text-[#0d1b2a] font-bold rounded-full whitespace-nowrap border border-white">
            代翻 (離線)
          </span>
        ) : isHost ? (
          <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-[#c9a96e] text-[#0d1b2a] font-bold rounded-full whitespace-nowrap border border-white">
            房主代翻
          </span>
        ) : null
      ) : null}

      {/* 卡匣容器 */}
      <div
        className={`relative flex items-center justify-center p-0.5 rounded-xl transition-all ${
          isHighlightSelected ? "-translate-y-2" : ""
        }`}
        style={{
          paddingBottom: hasCollision ? `${(allCards.length - 1) * 16}px` : "2px",
        }}
      >
        {/* 嚴格守護暗牌：未翻開前永遠維持卡背！ */}
        <Card
          value={allCards[0].cardValue}
          flipped={Boolean(allCards[0].flipped)}
          isOwner={Boolean(isCardMine(allCards[0]))}
          playerName={allCards[0].playerName}
          showSeal={Boolean(lockedList.includes(allCards[0].playerId))}
          isError={isFinishedReveal && isCorrectOrder === false}
          onClick={() => handleCardClick(allCards[0])}
        />

        {allCards.slice(1).map((c, idx) => {
          const offsetY = (idx + 1) * 16;
          const offsetX = (idx + 1) % 2 === 1 ? 6 : -6;
          return (
            <div
              key={c.uniqueKey || `${c.playerId}-${idx}`}
              style={{
                top: `${offsetY}px`,
                left: `${offsetX}px`,
                zIndex: (idx + 1) * 10,
              }}
              className="absolute transition-all duration-200 hover:scale-105"
            >
              <Card
                value={c.cardValue}
                flipped={Boolean(c.flipped)}
                isOwner={Boolean(isCardMine(c))}
                playerName={c.playerName}
                showSeal={Boolean(lockedList.includes(c.playerId))}
                isError={isFinishedReveal && isCorrectOrder === false}
                onClick={() => handleCardClick(c)}
              />
            </div>
          );
        })}
      </div>

      {/* 底部出牌玩家標籤 */}
      <div className="mt-1 flex flex-col items-center">
        <span
          className={`text-[10px] font-bold truncate max-w-[85px] px-2 py-0.5 rounded border ${
            hasCollision
              ? "bg-[#c73e1d]/90 text-white border-white"
              : isAnyCardMine
              ? "bg-[#c9a96e]/20 text-[#c9a96e] border-[#c9a96e]/50 font-black"
              : "bg-[#1b2838]/80 text-[#e8dcc8] border-[rgba(201,169,110,0.3)]"
          }`}
        >
          {bottomPlayerNamesText}
        </span>

        {!isFlipped && status === "playing" && (
          <span
            className={`text-[9px] mt-0.5 font-bold ${
              isOwnerLocked ? "text-[#34d399]" : "text-[#8a9bb0]"
            }`}
          >
            {isOwnerLocked ? "✓ 已鎖定" : "點牌收回"}
          </span>
        )}
      </div>
    </div>
  );
}
