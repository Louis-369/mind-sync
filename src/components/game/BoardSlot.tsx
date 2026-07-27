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
  isCurrentPlayer: boolean;
  currentConnectionId?: string;
  isFlipped?: boolean;
  isSelected?: boolean;
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
  isCurrentPlayer,
  currentConnectionId,
  isFlipped = false,
  isSelected = false,
  onSelectSlot,
  onRecall,
  onFlip,
}: BoardSlotProps) {
  // 相容單張卡牌與多張卡牌槽位
  const allCards = cards.length > 0 ? cards : card ? [card] : [];
  const topCard = allCards[allCards.length - 1];
  const hasCollision = allCards.length > 1;

  // 取得撞牌玩家名字清單 (例如：你與小華撞牌 2張)
  const collisionNamesText = hasCollision
    ? Array.from(
        new Set(
          allCards.map((c) =>
            currentConnectionId && c.playerId === currentConnectionId
              ? "你"
              : c.playerId === topCard?.playerId && isCurrentPlayer
              ? "你"
              : c.playerName || "匿名"
          )
        )
      ).join("與") + `撞牌 ${allCards.length}張`
    : "";

  if (allCards.length === 0) {
    return (
      <div
        onClick={() => onSelectSlot && onSelectSlot(slotId)}
        className={`w-16 h-24 md:w-20 md:h-28 rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
          isSelected
            ? "border-ukiyo-gold bg-ukiyo-gold/20 text-ukiyo-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            : "border-ukiyo-foam/25 bg-ukiyo-surface/30 text-ukiyo-mist/50 hover:border-ukiyo-gold/60 hover:text-ukiyo-gold"
        }`}
      >
        <span className="text-[11px] font-serif font-bold">
          {isSelected ? "已選定" : "空席位"}
        </span>
        <span className="text-[9px] font-mono opacity-60 mt-1">
          {isSelected ? "點擊手牌落牌" : "點擊選位"}
        </span>
      </div>
    );
  }

  const handleCardClick = (e?: React.MouseEvent) => {
    // 點擊卡片本體時進行收回或翻牌
    if (e) e.stopPropagation();
    if (topCard?.flipped) return;

    const targetKey = topCard?.uniqueKey || slotId;

    if (isCurrentPlayer) {
      if (status === "playing" && !isOwnerLocked && onRecall) {
        // 未同意鎖定前：點擊收回手牌
        onRecall(targetKey);
      } else if (status === "locked" && onFlip) {
        // 全員鎖定後：點擊翻開卡牌
        onFlip(targetKey);
      }
    } else {
      // 點擊非自己的卡牌槽位時，視為選擇該槽位以供落牌
      if (onSelectSlot) {
        onSelectSlot(slotId);
      }
    }
  };

  return (
    <div
      onClick={() => onSelectSlot && onSelectSlot(slotId)}
      className={`relative group flex flex-col items-center p-1 rounded-2xl cursor-pointer transition-all border ${
        isSelected
          ? "ring-2 ring-ukiyo-gold bg-ukiyo-gold/15 border-ukiyo-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          : hasCollision
          ? "ring-2 ring-ukiyo-vermillion border-ukiyo-vermillion bg-ukiyo-vermillion/10 shadow-[0_0_18px_rgba(196,43,28,0.5)]"
          : "border-transparent hover:border-ukiyo-foam/20"
      }`}
    >
      {/* 撞牌碰撞警示標籤 (顯示撞牌玩家姓名、無 Emoji、無括號、不換行) */}
      {hasCollision && (
        <div className="absolute -top-3.5 z-30 bg-ukiyo-vermillion text-ukiyo-cream text-[9px] font-serif font-bold px-2 py-0.5 rounded-full shadow-lg border border-ukiyo-cream/40 whitespace-nowrap animate-bounce">
          {collisionNamesText}
        </div>
      )}

      {/* 鎖定同意朱紅落款小印章「確」(僅在同意鎖定、未翻牌且未結束時顯示) */}
      {isOwnerLocked && !topCard?.flipped && status !== "finished" && (
        <div
          title="已完成心靈確認"
          className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded ukiyo-seal flex items-center justify-center text-[10px] shadow-md border border-ukiyo-cream/30 font-serif"
        >
          確
        </div>
      )}

      {/* 卡牌渲染 (紙牌接龍式上下垂直錯位重疊效果) */}
      <div
        className="relative flex items-center justify-center"
        style={{
          paddingBottom: hasCollision ? `${(allCards.length - 1) * 18}px` : "0px",
        }}
      >
        {allCards.map((c, idx) => {
          const isMe =
            (currentConnectionId && c.playerId === currentConnectionId) ||
            (c.playerId === topCard.playerId && isCurrentPlayer);
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
                onClick={handleCardClick}
              />

              {/* 自己蓋著的牌：在右下角呈現半透明可記憶數字 (不加括號) */}
              {isMe && !c.flipped && (
                <div className="absolute bottom-1 right-1.5 z-20 pointer-events-none bg-ukiyo-bg/85 border border-ukiyo-gold/40 px-1 py-0.2 rounded text-[10px] font-mono font-bold text-ukiyo-gold shadow-sm">
                  {c.cardValue}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 出牌者標籤 (自己的牌極簡為「你」) */}
      <div className="mt-1 flex items-center space-x-1">
        <span
          className={`text-[10px] font-serif px-1.5 py-0.5 rounded border truncate max-w-[85px] transition-colors ${
            isCurrentPlayer
              ? "bg-ukiyo-surface/90 text-ukiyo-gold border-ukiyo-gold/40 font-bold"
              : "bg-ukiyo-surface/60 text-ukiyo-mist border-ukiyo-foam/10"
          }`}
        >
          {isCurrentPlayer ? "你" : topCard.playerName || "匿名"}
        </span>
      </div>

      {/* 提示標籤 (僅自己未翻開且未結算時；鎖定後隱藏收回提示，去「可」字) */}
      {isCurrentPlayer && !topCard?.flipped && status !== "finished" && (
        status === "locked" ? (
          <span className="absolute -top-2 text-[9px] font-serif px-1.5 py-0.5 rounded-full shadow bg-ukiyo-surface border border-ukiyo-gold text-ukiyo-gold font-bold">
            點擊翻牌
          </span>
        ) : !isOwnerLocked ? (
          <span className="absolute -top-2 text-[9px] font-serif px-1.5 py-0.5 rounded-full shadow bg-ukiyo-surface border border-ukiyo-foam/30 text-ukiyo-mist">
            點擊收回
          </span>
        ) : null
      )}
    </div>
  );
}
