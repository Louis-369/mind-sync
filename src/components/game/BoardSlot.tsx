"use client";

import React from "react";
import { Card } from "../ui/Card";
import { BoardCard } from "../../types/game";
import { sound } from "../../lib/soundEngine";

interface BoardSlotProps {
  slotId: string;
  cards: BoardCard[];
  status: string;
  lockedList?: string[];
  isOwnerLocked?: boolean;
  isCurrentPlayer?: boolean;
  currentConnectionId?: string;
  currentPlayerId?: string;
  isSelected?: boolean;
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

export function BoardSlot({
  slotId,
  cards,
  status,
  lockedList = [],
  isOwnerLocked = false,
  isCurrentPlayer = false,
  currentConnectionId,
  currentPlayerId,
  isSelected = false,
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
        className={`relative w-16 h-24 sm:w-18 sm:h-26 md:w-20 md:h-28 rounded-lg border-2 transition-all flex flex-col items-center justify-between p-2 font-mono ${
          canSelect ? "cursor-pointer hover:border-[#f59e0b] hover:bg-[#f59e0b]/10 active:scale-95" : "cursor-default opacity-40"
        } ${
          isSelected
            ? "border-[#f59e0b] bg-[#f59e0b]/20 text-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            : focusedByNames.length > 0
            ? "border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8]"
            : "border-dashed border-slate-700 bg-[#12161f]/80 text-slate-500 hover:border-slate-500"
        }`}
      >
        <span className="text-[10px] text-slate-400 font-bold">第 {slotIndex} 格</span>

        {/* 清楚大字 1, 2, 3, 4 */}
        <div className="text-xl sm:text-2xl font-black text-slate-300">
          {slotIndex}
        </div>

        {isSelected ? (
          <span className="text-[10px] font-bold text-[#f59e0b] tracking-wider animate-pulse">
            放這格
          </span>
        ) : focusedByNames.length > 0 ? (
          <span className="text-[9px] text-[#38bdf8] truncate max-w-full">
            {focusedByNames[0]} 想放這
          </span>
        ) : (
          <span className="text-[9px] text-slate-500">空位</span>
        )}
      </div>
    );
  }

  const handleCardClick = (clickedCard?: BoardCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const targetCard =
      clickedCard &&
      ((currentConnectionId && clickedCard.playerId === currentConnectionId) ||
        (clickedCard.playerId === topCard?.playerId && isCurrentPlayer))
        ? clickedCard
        : myUnflippedCard;

    if (targetCard && !targetCard.flipped) {
      if (status === "playing" && !isOwnerLocked && handleRecall) {
        handleRecall(targetCard.uniqueKey || slotId);
        return;
      }
    }

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
      className="relative flex flex-col items-center pt-3.5 p-1 cursor-pointer touch-manipulation group"
    >
      {/* 狀態指示標籤 */}
      {isFinishedReveal && isCorrectOrder === false ? (
        <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-red-600 text-white font-bold rounded-full whitespace-nowrap shadow-md border border-white animate-ascii-glitch">
          順序錯 ✕
        </span>
      ) : hasCollision ? (
        <div className="absolute top-0 z-30 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md border border-white animate-bounce">
          ⚡ 撞牌！({collisionNamesText})
        </div>
      ) : status === "locked" && topCard && !topCard?.flipped ? (
        myUnflippedCard ? (
          <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-[#f59e0b] text-black font-bold rounded-full whitespace-nowrap animate-pulse shadow-md">
            點擊翻牌
          </span>
        ) : !isOwnerOnline ? (
          <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-[#38bdf8] text-black font-bold rounded-full whitespace-nowrap border border-white">
            代翻 (離線)
          </span>
        ) : isHost ? (
          <span className="absolute top-0 z-30 text-[10px] px-2 py-0.5 bg-amber-500 text-black font-bold rounded-full whitespace-nowrap border border-white">
            房主代翻
          </span>
        ) : null
      ) : null}

      {/* 卡牌容器 */}
      <div
        className={`relative flex items-center justify-center p-0.5 rounded-lg transition-all ${
          isFinishedReveal && isCorrectOrder === true
            ? "ring-3 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            : isFinishedReveal && isCorrectOrder === false
            ? "ring-3 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
            : isHighlightSelected
            ? "ring-3 ring-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            : hasCollision
            ? "ring-3 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            : ""
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
          className={`text-[10px] font-bold truncate max-w-[85px] px-1.5 py-0.5 rounded ${
            hasCollision
              ? "bg-red-950/90 text-red-300 border border-red-500/60"
              : isAnyCardMine
              ? "bg-amber-950/80 text-[#f59e0b] border border-[#f59e0b]/40"
              : "text-slate-300"
          }`}
        >
          {bottomPlayerNamesText}
        </span>

        {!isFlipped && status === "playing" && (
          <span
            className={`text-[9px] mt-0.5 font-medium ${
              isOwnerLocked ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            {isOwnerLocked ? "✓ 已鎖定" : "待鎖定"}
          </span>
        )}
      </div>
    </div>
  );
}
