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
  isFlipped = false,
  isSelected = false,
  isCorrectOrder,
  isFinishedReveal = false,
  onSelectSlot,
  onRecall,
  onFlip,
}: BoardSlotProps) {
  // 相容單卡與多卡模式
  const allCards = cards.length > 0 ? cards : card ? [card] : [];
  const topCard = allCards[allCards.length - 1];
  const hasCollision = allCards.length > 1;

  // 找尋當前玩家在這個槽位放置的未翻開卡牌
  const myUnflippedCard = allCards.find(
    (c) =>
      !c.flipped &&
      ((currentConnectionId && c.playerId === currentConnectionId) ||
        (c.playerName && isCurrentPlayer))
  );

  // 整理參與碰撞的所有玩家名字
  const collisionNamesText = allCards
    .map((c) =>
      currentConnectionId && c.playerId === currentConnectionId
        ? "你"
        : c.playerName || "匿名"
    )
    .join("、");

  const bottomPlayerNamesText = hasCollision
    ? Array.from(
        new Set(
          allCards.map((c) =>
            currentConnectionId && c.playerId === currentConnectionId
              ? "你"
              : c.playerName || "匿名"
          )
        )
      ).join("、")
    : isCurrentPlayer
    ? "你"
    : topCard?.playerName || "匿名";

  const isAnyCardMine = allCards.some(
    (c) => currentConnectionId && c.playerId === currentConnectionId
  );

  if (allCards.length === 0) {
    const canSelect = status === "playing";
    return (
      <div
        onClick={() => canSelect && onSelectSlot && onSelectSlot(slotId)}
        className={`w-14 h-22 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-xl border border-dashed flex flex-col items-center justify-center transition-all ${
          canSelect ? "cursor-pointer hover:scale-105" : "cursor-default opacity-60"
        } ${
          isSelected
            ? "border-ukiyo-gold bg-ukiyo-gold/20 text-ukiyo-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            : "border-ukiyo-foam/25 bg-ukiyo-surface/30 text-ukiyo-mist/50 hover:border-ukiyo-gold/60 hover:text-ukiyo-gold"
        }`}
      >
        <span className="text-[11px] font-serif font-bold">
          {isSelected ? "已選定" : "空席位"}
        </span>
        <span className="text-[9px] font-mono opacity-60 mt-1">
          {isSelected ? "點擊手牌落牌" : canSelect ? "點擊選位" : "靜候發牌"}
        </span>
      </div>
    );
  }

  // 智慧點擊處理常式 (支援手機觸控與桌機點擊，優先處理個人卡牌收回/翻牌)
  const handleCardClick = (clickedCard?: BoardCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 優先認定點擊屬於自己的卡牌
    const targetCard =
      clickedCard &&
      ((currentConnectionId && clickedCard.playerId === currentConnectionId) ||
        (clickedCard.playerId === topCard?.playerId && isCurrentPlayer))
        ? clickedCard
        : myUnflippedCard;

    if (targetCard && !targetCard.flipped) {
      if (status === "playing" && !isOwnerLocked && onRecall) {
        // 未同意鎖定前：點擊收回手牌
        onRecall(targetCard.uniqueKey || slotId);
        return;
      } else if (status === "locked" && onFlip) {
        // 全員鎖定後：點擊翻開卡牌
        onFlip(targetCard.uniqueKey || slotId);
        return;
      }
    }

    // 若該槽位沒有自己的未翻開卡牌，則點擊進行選位 (僅遊戲進行中允許選位)
    if (status === "playing" && onSelectSlot) {
      onSelectSlot(slotId);
    }
  };

  const isHighlightSelected = status === "playing" && isSelected;
  const slotIndex = parseInt(slotId.replace("slot-", ""), 10) + 1;
  const isCardFlipped = topCard?.flipped === true;

  return (
    <div
      onClick={(e) => handleCardClick(undefined, e)}
      className="relative group flex flex-col items-center p-1 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-ukiyo-foam/20 touch-manipulation"
    >
      {/* 席位編號標籤 (#1, #2, #3... 僅在卡牌未翻開時顯示金箔色標籤) */}
      {!isCardFlipped && (
        <div className="absolute top-1 left-1.5 z-20 pointer-events-none">
          <span className="text-[10px] font-mono font-bold text-ukiyo-gold bg-ukiyo-surface/90 px-1.5 py-0.2 rounded border border-ukiyo-gold/40 shadow-sm">
            #{slotIndex}
          </span>
        </div>
      )}

      {/* 標籤權重化渲染 (全場翻開結算後：錯誤時顯示 ✕ 錯誤；碰撞時顯示碰撞名字；鎖定階段顯示點擊翻牌) */}
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

      {/* 鎖定同意朱紅落款小印章「確」(僅在個人同意鎖定、遊戲進行中、且牌未翻開時顯示) */}
      {isOwnerLocked && status === "playing" && !topCard?.flipped && (
        <div
          title="已確認落牌"
          className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded ukiyo-seal flex items-center justify-center text-[10px] shadow-md border border-ukiyo-cream/30 font-serif pointer-events-none"
        >
          確
        </div>
      )}

      {/* 卡牌實體區域 (紅/綠/金高亮微光：全場卡牌皆翻開後才展示微光特效) */}
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
            (currentConnectionId && c.playerId === currentConnectionId) ||
            (c.playerId === topCard?.playerId && isCurrentPlayer);
          return (
            <div
              key={`${c.placedAt}-${idx}`}
              style={{
                transform: idx > 0 ? `translateY(${idx * 18}px)` : "none",
                zIndex: idx + 1,
              }}
              className={idx > 0 ? "absolute top-0 left-0" : "relative"}
            >
              <Card
                value={c.cardValue}
                flipped={c.flipped || isFlipped}
                isOwner={isMe}
                playerName={c.playerName}
                onClick={() => handleCardClick(c)}
              />

              {/* 自己蓋著的牌：在右下角呈現半透明可記憶數字 (同意鎖定與全員鎖定後自動隱藏) */}
              {isMe && !c.flipped && !isOwnerLocked && status === "playing" && (
                <div className="absolute bottom-1 right-1.5 z-20 pointer-events-none bg-ukiyo-bg/85 border border-ukiyo-gold/40 px-1 py-0.2 rounded text-[10px] font-mono font-bold text-ukiyo-gold shadow-sm">
                  {c.cardValue}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 出牌者標籤 (獨立在微光外框下方) */}
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
