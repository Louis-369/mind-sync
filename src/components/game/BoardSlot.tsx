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
  onFlip?: (uniqueKey: string) => void;
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
  onFlip,
}: BoardSlotProps) {
  const slotIndex = parseInt(slotId.replace("slot-", ""), 10) + 1;
  const hexLabel = `0x${slotIndex.toString(16).toUpperCase().padStart(2, "0")}`;

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
        className={`relative w-16 h-24 sm:w-18 sm:h-26 md:w-20 md:h-28 border transition-all flex flex-col items-center justify-between p-2 font-mono ${
          canSelect ? "cursor-pointer hover:border-[#00ff9d] hover:bg-[#00ff9d]/10 active:scale-95" : "cursor-default opacity-50"
        } ${
          isSelected
            ? "border-2 border-[#00ff9d] bg-[#00ff9d]/20 text-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.5)]"
            : focusedByNames.length > 0
            ? "border border-[#00e5ff] bg-[#00e5ff]/10 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]"
            : "border-dashed border-[#00ff9d]/30 bg-[#030609]/80 text-[#00ff9d]/40"
        }`}
      >
        <div className="w-full flex items-center justify-between text-[8px] text-[#00e5ff]/80">
          <span>+</span>
          <span>NODE</span>
          <span>+</span>
        </div>

        <div className="text-sm sm:text-base font-black tracking-widest text-[#00ff9d]">
          {hexLabel}
        </div>

        {isSelected ? (
          <span className="text-[9px] font-bold text-[#00ff9d] tracking-widest animate-pulse">
            [INSERT]
          </span>
        ) : focusedByNames.length > 0 ? (
          <span className="text-[8px] text-[#00e5ff] truncate max-w-full">
            &gt; {focusedByNames[0]}
          </span>
        ) : (
          <span className="text-[8px] text-[#00ff9d]/40">EMPTY</span>
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
      if (status === "playing" && !isOwnerLocked && onRecall) {
        onRecall(targetCard.uniqueKey || slotId);
        return;
      }
    }

    const canFlipNow =
      status === "locked" &&
      topCard &&
      !topCard.flipped &&
      (Boolean(myUnflippedCard) || !isOwnerOnline || Boolean(isHost));

    if (canFlipNow && onFlip) {
      onFlip(topCard.uniqueKey || slotId);
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
      className="relative flex flex-col items-center pt-3 p-1 cursor-pointer font-mono touch-manipulation group"
    >
      {/* 狀態指示標籤 */}
      {isFinishedReveal && isCorrectOrder === false ? (
        <span className="absolute top-0 z-30 text-[9px] px-1.5 py-0.5 bg-[#ff0055] text-white font-bold whitespace-nowrap animate-ascii-glitch shadow-[0_0_10px_#ff0055] border border-white">
          [ERR_NODE ✕]
        </span>
      ) : hasCollision ? (
        <div className="absolute top-0 z-30 bg-[#ff0055] text-white text-[9px] font-bold px-1.5 py-0.5 whitespace-nowrap shadow-[0_0_12px_#ff0055] border border-white animate-bounce">
          [!! COLLISION !!]
        </div>
      ) : status === "locked" && topCard && !topCard?.flipped ? (
        myUnflippedCard ? (
          <span className="absolute top-0 z-30 text-[9px] px-2 py-0.5 bg-[#00ff9d] text-black font-black whitespace-nowrap animate-pulse shadow-[0_0_10px_#00ff9d]">
            [DECRYPT]
          </span>
        ) : !isOwnerOnline ? (
          <span className="absolute top-0 z-30 text-[9px] px-1.5 py-0.5 bg-[#00e5ff] text-black font-bold whitespace-nowrap border border-[#00e5ff]">
            [FORCE_DEC]
          </span>
        ) : isHost ? (
          <span className="absolute top-0 z-30 text-[9px] px-1.5 py-0.5 bg-[#ffb000] text-black font-bold whitespace-nowrap border border-[#ffb000]">
            [ROOT_DEC]
          </span>
        ) : null
      ) : null}

      {/* 卡匣容器 */}
      <div
        className={`relative flex items-center justify-center p-0.5 transition-all ${
          isFinishedReveal && isCorrectOrder === true
            ? "ring-2 ring-[#00ff9d] shadow-[0_0_18px_rgba(0,255,157,0.6)]"
            : isFinishedReveal && isCorrectOrder === false
            ? "ring-2 ring-[#ff0055] shadow-[0_0_20px_#ff0055]"
            : isHighlightSelected
            ? "ring-2 ring-[#00e5ff] shadow-[0_0_15px_#00e5ff]"
            : hasCollision
            ? "ring-2 ring-[#ff0055] shadow-[0_0_15px_#ff0055]"
            : ""
        }`}
        style={{
          paddingBottom: hasCollision ? `${(allCards.length - 1) * 16}px` : "2px",
        }}
      >
        {allCards.map((c, idx) => {
          const isMe =
            (currentConnectionId && (c.playerId === currentConnectionId || (c as any).connectionId === currentConnectionId)) ||
            (currentPlayerId && c.playerId === currentPlayerId) ||
            (c.playerId === topCard?.playerId && isCurrentPlayer);

          const isCardLocked =
            (c.playerId && lockedList.includes(c.playerId)) ||
            ((c as any).connectionId && lockedList.includes((c as any).connectionId)) ||
            (isOwnerLocked && (isMe || idx === allCards.length - 1));

          return (
            <div
              key={`${c.placedAt}-${idx}`}
              style={{
                transform: idx > 0 ? `translateY(${idx * 16}px)` : "none",
                zIndex: idx + 1,
              }}
              className={idx > 0 ? "absolute top-0 left-0 pointer-events-auto" : "relative pointer-events-auto"}
            >
              <Card
                value={c.cardValue}
                flipped={c.flipped || isFlipped}
                isOwner={isMe}
                playerName={c.playerName}
                showSeal={status === "playing" && Boolean(isCardLocked) && !(c.flipped || isFlipped)}
                isError={isFinishedReveal && isCorrectOrder === false}
                onClick={() => handleCardClick(c)}
              />

              {/* 自己未翻開之卡牌右下角數值 */}
              {isMe && !c.flipped && (status === "playing" || status === "locked") && (
                <div className="absolute bottom-1 right-1.5 z-20 pointer-events-none text-[10px] font-mono font-black text-[#00ff9d] bg-black/80 px-1 border border-[#00ff9d]/50">
                  {c.cardValue}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 特工代號標籤 */}
      <div className="mt-1 flex items-center space-x-1 z-10">
        <span
          className={`text-[9px] font-mono px-1.5 py-0.2 border truncate max-w-[120px] ${
            isAnyCardMine
              ? "bg-[#00ff9d]/20 text-[#00ff9d] border-[#00ff9d] font-bold"
              : "bg-black/60 text-[#00e5ff]/80 border-[#00e5ff]/30"
          }`}
        >
          {bottomPlayerNamesText}
        </span>
      </div>
    </div>
  );
}
