"use client";

import React from "react";
import { Card } from "../ui/Card";
import { BoardCard } from "../../types/game";
import { sound } from "../../lib/soundEngine";

interface BoardSlotProps {
  slotId: string;
  cards?: BoardCard[];
  card?: BoardCard;
  status?: string;
  lockedList?: string[];
  isOwnerLocked?: boolean;
  isCurrentPlayer?: boolean;
  currentConnectionId?: string;
  currentPlayerId?: string;
  isFlipped?: boolean;
  isSelected?: boolean;
  isCorrectOrder?: boolean;
  isFinishedReveal?: boolean;
  focusedByNames?: string[];
  isHost?: boolean;
  activePlayerIds?: Set<string>;
  onSelectSlot?: (slotId: string) => void;
  onRecall?: (targetKey: string) => void;
  onFlip?: (targetKey: string) => void;
}

export function BoardSlot({
  slotId,
  cards = [],
  card,
  status = "playing",
  lockedList = [],
  isOwnerLocked = false,
  isCurrentPlayer = false,
  currentConnectionId,
  currentPlayerId,
  isFlipped = false,
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
  const allCards = cards.length > 0 ? cards : card ? [card] : [];
  const topCard = allCards[allCards.length - 1];
  const hasCollision = allCards.length > 1;

  const isCardMine = (c: BoardCard) =>
    (currentConnectionId && (c.playerId === currentConnectionId || (c as any).connectionId === currentConnectionId)) ||
    (currentPlayerId && c.playerId === currentPlayerId);

  const myUnflippedCard = allCards.find(
    (c) => !c.flipped && (isCardMine(c) || (c.playerName && isCurrentPlayer))
  );

  const isOwnerOnline = topCard
    ? activePlayerIds
      ? activePlayerIds.has(topCard.playerId) ||
        Boolean((topCard as any).connectionId && activePlayerIds.has((topCard as any).connectionId))
      : true
    : true;

  const collisionNamesText = allCards
    .map((c) => (isCardMine(c) ? "你" : c.playerName || "匿名"))
    .join("、");

  const bottomPlayerNamesText = hasCollision
    ? Array.from(new Set(allCards.map((c) => (isCardMine(c) ? "你" : c.playerName || "匿名")))).join("、")
    : isCurrentPlayer
    ? "你"
    : topCard?.playerName || "匿名";

  const isAnyCardMine = allCards.some((c) => isCardMine(c));

  const KANJI_NUMS = ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾", "拾壹", "拾貳"];
  const kanjiLabel = KANJI_NUMS[(slotIndex - 1) % KANJI_NUMS.length] || String(slotIndex);

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
        className={`relative w-16 h-24 sm:w-18 sm:h-26 md:w-20 md:h-28 rounded-2xl border transition-all flex flex-col items-center justify-center ${
          canSelect ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default opacity-60"
        } ${
          isSelected
            ? "border-ukiyo-gold bg-ukiyo-gold/25 text-ukiyo-gold shadow-[0_0_22px_rgba(201,169,110,0.6)] ring-2 ring-ukiyo-gold/50"
            : focusedByNames.length > 0
            ? "border-ukiyo-wave bg-ukiyo-wave/20 text-ukiyo-foam shadow-[0_0_15px_rgba(45,90,123,0.5)]"
            : "border-dashed border-ukiyo-foam/20 bg-ukiyo-surface/40 text-ukiyo-mist/60 hover:border-ukiyo-gold/50 hover:bg-ukiyo-surface/60"
        }`}
      >
        {/* 大字書法漢字席號 (水墨質感) */}
        <div className={`text-2xl sm:text-3xl font-serif font-black transition-opacity select-none ${
          isSelected ? "text-ukiyo-gold opacity-90 drop-shadow" : "text-ukiyo-foam/30"
        }`}>
          {kanjiLabel}
        </div>

        {/* 狀態標籤 */}
        {isSelected ? (
          <span className="text-[10px] sm:text-xs font-serif font-bold text-ukiyo-gold tracking-widest mt-1 animate-pulse">
            落此席
          </span>
        ) : focusedByNames.length > 0 ? (
          <span className="text-[9px] font-serif text-ukiyo-mist bg-ukiyo-bg/80 px-1.5 py-0.5 rounded-full border border-ukiyo-foam/15 truncate max-w-[90%]">
            💭 {focusedByNames[0]} 凝視
          </span>
        ) : null}
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

    // 揭牌階段：本人、離線代翻或房主均可點擊揭牌 (徹底杜絕死鎖)
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
      className="relative group flex flex-col items-center pt-3.5 p-1 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-ukiyo-foam/20 touch-manipulation"
    >
      {/* 標籤權重化渲染 (撞牌 / 破綻 / 揭牌 / 代翻) */}
      {isFinishedReveal && isCorrectOrder === false ? (
        <span className="absolute top-0 z-30 text-[10px] font-serif px-2.5 py-0.5 rounded-full shadow-lg bg-ukiyo-vermillion text-ukiyo-cream font-black pointer-events-none whitespace-nowrap animate-screen-shake border border-ukiyo-cream/40">
          破綻 ✕
        </span>
      ) : hasCollision ? (
        <div className="absolute top-0 z-30 bg-ukiyo-vermillion text-ukiyo-cream text-[10px] font-serif font-black px-2.5 py-0.5 rounded-full shadow-lg border border-ukiyo-cream/40 whitespace-nowrap animate-bounce pointer-events-none">
          ⚡ 撞席！({collisionNamesText})
        </div>
      ) : status === "locked" && topCard && !topCard?.flipped ? (
        myUnflippedCard ? (
          <span className="absolute top-0 z-30 text-[10px] font-serif px-2.5 py-0.5 rounded-full shadow bg-ukiyo-gold text-ukiyo-bg font-black pointer-events-none whitespace-nowrap animate-pulse">
            揭牌
          </span>
        ) : !isOwnerOnline ? (
          <span className="absolute top-0 z-30 text-[10px] font-serif px-2.5 py-0.5 rounded-full shadow bg-ukiyo-wave text-ukiyo-cream font-bold pointer-events-none whitespace-nowrap animate-pulse border border-ukiyo-foam/30">
            代翻 (離線)
          </span>
        ) : isHost ? (
          <span className="absolute top-0 z-30 text-[10px] font-serif px-2.5 py-0.5 rounded-full shadow bg-ukiyo-surface text-ukiyo-gold font-bold pointer-events-none whitespace-nowrap border border-ukiyo-gold/40">
            房主代翻
          </span>
        ) : null
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

          const isCardLocked =
            (c.playerId && lockedList.includes(c.playerId)) ||
            ((c as any).connectionId && lockedList.includes((c as any).connectionId)) ||
            (isOwnerLocked && (isMe || idx === allCards.length - 1));

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
                showSeal={status === "playing" && Boolean(isCardLocked) && !(c.flipped || isFlipped)}
                isError={isFinishedReveal && isCorrectOrder === false}
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
