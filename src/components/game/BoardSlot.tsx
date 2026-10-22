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

// 根據槽位在總長度中的比例計算色溫風格
function getSlotSpectrumTheme(index: number, total: number) {
  const ratio = total > 1 ? index / (total - 1) : 0;
  if (ratio <= 0.25) {
    return {
      name: "極小",
      icon: "❄️",
      border: "border-[#0ea5e9]",
      bg: "bg-[#0ea5e9]/10",
      accent: "#0ea5e9",
      text: "text-[#0ea5e9]",
      pill: "bg-[#0ea5e9] text-white",
    };
  }
  if (ratio <= 0.55) {
    return {
      name: "偏小",
      icon: "🌿",
      border: "border-[#10b981]",
      bg: "bg-[#10b981]/10",
      accent: "#10b981",
      text: "text-[#10b981]",
      pill: "bg-[#10b981] text-white",
    };
  }
  if (ratio <= 0.8) {
    return {
      name: "偏大",
      icon: "☀️",
      border: "border-[#f59e0b]",
      bg: "bg-[#f59e0b]/10",
      accent: "#f59e0b",
      text: "text-[#f59e0b]",
      pill: "bg-[#f59e0b] text-[#18181b]",
    };
  }
  return {
    name: "極大",
    icon: "🔥",
    border: "border-[#ef4444]",
    bg: "bg-[#ef4444]/10",
    accent: "#ef4444",
    text: "text-[#ef4444]",
    pill: "bg-[#ef4444] text-white",
  };
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
        className={`relative w-16 h-24 sm:w-18 sm:h-26 md:w-22 md:h-30 rounded-xl border-2 transition-all flex flex-col items-center justify-between p-2 select-none ${
          canSelect
            ? "cursor-pointer hover:-translate-y-1 active:translate-y-0.5"
            : "cursor-default opacity-40"
        } ${
          isSelected
            ? "border-[#18181b] bg-[#fef3c7] shadow-[4px_4px_0px_#18181b] scale-105"
            : selectedHandCard !== null && canSelect
            ? "border-[#18181b] bg-[#ffffff] border-dashed shadow-[2px_2px_0px_#18181b] hover:bg-[#fef3c7]"
            : "border-2 border-[#18181b]/30 bg-[#ffffff]/70 shadow-[2px_2px_0px_rgba(24,24,27,0.15)]"
        }`}
      >
        {/* 頂部溫度圖標 + 席位編號 */}
        <div className="w-full flex items-center justify-between text-[11px] font-black">
          <span title={slotTheme.name}>{slotTheme.icon}</span>
          <span className="text-slate-500 font-mono">第 {slotIndex} 格</span>
        </div>

        {/* 清楚大字 1, 2, 3, 4 */}
        <div className="text-2xl sm:text-3xl font-black text-[#18181b]/80 font-mono">
          {slotIndex}
        </div>

        {/* 底部動態提示標籤 */}
        {isSelected ? (
          <span className="text-[10px] font-black bg-[#f59e0b] text-[#18181b] px-2 py-0.5 rounded-full border border-[#18181b] animate-bounce">
            放這格
          </span>
        ) : selectedHandCard !== null && canSelect ? (
          <span className="text-[10px] font-bold text-[#0ea5e9] bg-[#e0f2fe] px-1.5 py-0.5 rounded border border-[#0ea5e9]">
            放入 {selectedHandCard}
          </span>
        ) : focusedByNames.length > 0 ? (
          <span className="text-[9px] font-bold text-[#0ea5e9] truncate max-w-full">
            {focusedByNames[0]} 想放
          </span>
        ) : (
          <span className="text-[9px] text-slate-400 font-medium">空位</span>
        )}
      </div>
    );
  }

  // 有卡牌時的點擊處理
  const handleCardClick = (clickedCard?: BoardCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const targetCard =
      clickedCard &&
      ((currentConnectionId && clickedCard.playerId === currentConnectionId) ||
        (clickedCard.playerId === topCard?.playerId && isCurrentPlayer))
        ? clickedCard
        : myUnflippedCard;

    // 遊玩階段：點擊自己未翻開的牌可收回
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
      className="relative flex flex-col items-center pt-3.5 p-1 cursor-pointer touch-manipulation group select-none"
    >
      {/* 頂部狀態標籤 */}
      {isFinishedReveal && isCorrectOrder === false ? (
        <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-[#ef4444] text-white font-black rounded-full whitespace-nowrap shadow-[2px_2px_0px_#18181b] border-2 border-[#18181b] animate-bounce">
          順序錯 ✕
        </span>
      ) : hasCollision ? (
        <div className="absolute top-0 z-30 bg-[#f59e0b] text-[#18181b] text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-[2px_2px_0px_#18181b] border-2 border-[#18181b] animate-bounce">
          ⚡ 撞牌！({collisionNamesText})
        </div>
      ) : status === "locked" && topCard && !topCard?.flipped ? (
        myUnflippedCard ? (
          <span className="absolute top-0 z-30 text-[10px] px-2.5 py-0.5 bg-[#f59e0b] text-[#18181b] font-black rounded-full whitespace-nowrap shadow-[2px_2px_0px_#18181b] border-2 border-[#18181b] animate-pulse">
            👉 翻牌
          </span>
        ) : !isOwnerOnline ? (
          <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-[#0ea5e9] text-white font-black rounded-full whitespace-nowrap shadow-[2px_2px_0px_#18181b] border-2 border-[#18181b]">
            代翻 (離線)
          </span>
        ) : isHost ? (
          <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-[#f59e0b] text-[#18181b] font-black rounded-full whitespace-nowrap shadow-[2px_2px_0px_#18181b] border-2 border-[#18181b]">
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
        <Card
          value={allCards[0].cardValue}
          flipped={Boolean(allCards[0].flipped || isCardMine(allCards[0]))}
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
                flipped={Boolean(c.flipped || isCardMine(c))}
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

      {/* 底部玩家標籤 */}
      <div className="mt-1 flex flex-col items-center">
        <span
          className={`text-[11px] font-black truncate max-w-[90px] px-2 py-0.5 rounded-lg border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] ${
            hasCollision
              ? "bg-[#fee2e2] text-[#ef4444]"
              : isAnyCardMine
              ? "bg-[#fef3c7] text-[#b45309]"
              : "bg-[#ffffff] text-[#18181b]"
          }`}
        >
          {bottomPlayerNamesText}
        </span>

        {!isFlipped && status === "playing" && (
          <span
            className={`text-[9px] mt-0.5 font-bold ${
              isOwnerLocked ? "text-[#10b981]" : "text-slate-400"
            }`}
          >
            {isOwnerLocked ? "✓ 已鎖定" : "點卡牌收回"}
          </span>
        )}
      </div>
    </div>
  );
}
