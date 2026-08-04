"use client";

import React from "react";
import { Card } from "../ui/Card";
import { BoardCard } from "../../types/game";

interface BoardSlotProps {
  slotId: string;
  cards?: BoardCard[];
  card?: BoardCard;
  status?: string;
  isOwnerLocked?: boolean;
  isCurrentPlayer?: boolean;
  currentConnectionId?: string;
  currentPlayerId?: string;
  isFlipped?: boolean;
  isSelected?: boolean;
  isCorrectOrder?: boolean;
  isFinishedReveal?: boolean;
  onSelectSlot?: (slotId: string) => void;
  onRecall?: (targetKey: string) => void;
  onFlip?: (targetKey: string) => void;
}

export function BoardSlot({
  slotId,
  cards = [],
  card,
  status = "playing",
  isOwnerLocked = false,
  isCurrentPlayer = false,
  currentConnectionId,
  currentPlayerId,
  isFlipped = false,
  isSelected = false,
  isCorrectOrder,
  isFinishedReveal = false,
  onSelectSlot,
  onRecall,
  onFlip,
}: BoardSlotProps) {
  const slotIndex = parseInt(slotId.replace("slot-", ""), 10) + 1;
  const allCards = cards.length > 0 ? cards : card ? [card] : [];
  const topCard = allCards[allCards.length - 1];
  const hasCollision = allCards.length > 1;

  const isCardMine = (c: BoardCard) =>
    (currentConnectionId && (c.playerId === currentConnectionId || (c as any).connectionId === currentConnectionId)) ||
    (currentPlayerId && c.playerId === currentPlayerId);

  const myUnflippedCard = allCards.find(
    (c) => !c.flipped && (isCardMine(c) || (c.playerName && isCurrentPlayer))
  );

  const collisionNamesText = allCards
    .map((c) => (isCardMine(c) ? "你" : c.playerName || "匿名"))
    .join("、");

  const bottomPlayerNamesText = hasCollision
    ? Array.from(new Set(allCards.map((c) => (isCardMine(c) ? "你" : c.playerName || "匿名")))).join("、")
    : isCurrentPlayer
    ? "你"
    : topCard?.playerName || "匿名";

  const isAnyCardMine = allCards.some((c) => isCardMine(c));

  const KANJI_NUMS = ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾"];
  const kanjiLabel = KANJI_NUMS[(slotIndex - 1) % KANJI_NUMS.length] || String(slotIndex);

  if (allCards.length === 0) {
    const canSelect = status === "playing";
    return (
      <div
        onClick={() => canSelect && onSelectSlot && onSelectSlot(slotId)}
        className={`relative w-16 h-24 md:w-20 md:h-28 rounded-xl border border-dashed flex flex-col items-center justify-center transition-all ${
          canSelect ? "cursor-pointer hover:scale-105" : "cursor-default opacity-60"
        } ${
          isSelected
            ? "border-ukiyo-gold bg-ukiyo-gold/20 text-ukiyo-gold shadow-[0_0_20px_rgba(201,169,110,0.5)]"
            : "border-ukiyo-foam/25 bg-ukiyo-surface/30 text-ukiyo-mist/50 hover:border-ukiyo-gold/60 hover:text-ukiyo-gold"
        }`}
      >
        <div className="absolute top-1.5 left-2 pointer-events-none text-[11px] font-serif font-bold text-ukiyo-gold/80">
          {kanjiLabel}
        </div>
        <span className="text-[11px] font-serif font-bold">
          {isSelected ? "已選定" : "空席位"}
        </span>
        <span className="text-[9px] font-mono opacity-60 mt-1">
          {isSelected ? "點擊手牌落牌" : canSelect ? "點擊選位" : "靜候發牌"}
        </span>
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
      } else if (status === "locked" && onFlip) {
        onFlip(targetCard.uniqueKey || slotId);
        return;
      }
    }

    if (status === "playing" && onSelectSlot) {
      onSelectSlot(slotId);
    }
  };

  const isHighlightSelected = status === "playing" && isSelected;

  return (
    <div
      onClick={(e) => handleCardClick(undefined, e)}
      className="relative group flex flex-col items-center p-1 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-ukiyo-foam/20 touch-manipulation"
    >
      {/* 標籤權重化渲染 */}
      {isFinishedReveal && isCorrectOrder === false ? (
        <span className="absolute -top-3.5 z-50 text-[9px] font-serif px-2 py-0.5 rounded-full shadow bg-red-950 border border-ukiyo-vermillion text-red-400 font-bold pointer-events-none whitespace-nowrap animate-bounce">
          ✕ 錯誤
        </span>
      ) : hasCollision ? (
        <div className="absolute -top-3.5 z-50 bg-ukiyo-vermillion text-ukiyo-cream text-[9px] font-serif font-bold px-2 py-0.5 rounded-full shadow-lg border border-ukiyo-cream/40 whitespace-nowrap animate-bounce pointer-events-none">
          {collisionNamesText}
        </div>
      ) : status === "locked" && myUnflippedCard && !topCard?.flipped ? (
        <span className="absolute -top-3.5 z-50 text-[9px] font-serif px-2 py-0.5 rounded-full shadow bg-ukiyo-surface border border-ukiyo-gold text-ukiyo-gold font-bold pointer-events-none whitespace-nowrap animate-pulse">
          點擊翻牌
        </span>
      ) : null}

      {/* 卡牌實體區域 */}
      <div
        className={`relative flex items-center justify-center p-1 rounded-2xl transition-all border ${
          isFinishedReveal && isCorrectOrder === true
            ? "ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.5)]"
            : isFinishedReveal && isCorrectOrder === false
            ? "ring-2 ring-ukiyo-vermillion bg-ukiyo-vermillion/15 border-ukiyo-vermillion shadow-[0_0_20px_rgba(196,43,28,0.7)]"
            : isHighlightSelected
            ? "ring-2 ring-ukiyo-gold bg-ukiyo-gold/15 border-ukiyo-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            : hasCollision
            ? "ring-2 ring-ukiyo-vermillion border-ukiyo-vermillion bg-ukiyo-vermillion/10 shadow-[0_0_18px_rgba(196,43,28,0.5)]"
            : "border-transparent"
        }`}
        style={{
          paddingBottom: hasCollision ? `${(allCards.length - 1) * 18}px` : "4px",
        }}
      >
        {allCards.map((c, idx) => {
          const isMe =
            (currentConnectionId && (c.playerId === currentConnectionId || (c as any).connectionId === currentConnectionId)) ||
            (currentPlayerId && c.playerId === currentPlayerId) ||
            (c.playerId === topCard?.playerId && isCurrentPlayer);

          return (
            <div
              key={`${c.placedAt}-${idx}`}
              style={{
                transform: idx > 0 ? `translateY(${idx * 18}px)` : "none",
                zIndex: idx + 1,
              }}
              className={idx > 0 ? "absolute top-0 left-0 pointer-events-auto" : "relative pointer-events-auto"}
            >
              <Card
                value={c.cardValue}
                flipped={c.flipped || isFlipped}
                isOwner={isMe}
                playerName={c.playerName}
                showSeal={(isOwnerLocked || status === "locked") && !c.flipped}
                onClick={() => handleCardClick(c)}
              />

              {/* 自己蓋著的牌：在右下角呈現無框晶亮金箔數字 */}
              {isMe && !c.flipped && (status === "playing" || status === "locked") && (
                <div className="absolute bottom-1.5 right-2 z-20 pointer-events-none text-[11px] font-mono font-black text-ukiyo-gold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-tight">
                  {c.cardValue}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 出牌者標籤 */}
      <div className="mt-1 flex items-center space-x-1 z-10">
        <span
          className={`text-[10px] font-serif px-1.5 py-0.5 rounded border truncate max-w-[130px] transition-colors ${
            isAnyCardMine
              ? "bg-ukiyo-surface/90 text-ukiyo-gold border-ukiyo-gold/40 font-bold"
              : "bg-ukiyo-surface/60 text-ukiyo-mist border-ukiyo-foam/10"
          }`}
        >
          {bottomPlayerNamesText}
        </span>
      </div>
    </div>
  );
}
