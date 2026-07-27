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
  // 頂部極簡撞牌標籤 (例如：撞牌 2張)
  const collisionNamesText = hasCollision ? `撞牌 ${allCards.length}張` : "";

  // 判定該槽位中是否有屬於當前玩家的卡牌
  const isAnyCardMine = allCards.some(
    (c) =>
      (currentConnectionId && c.playerId === currentConnectionId) ||
      (c.playerId === topCard?.playerId && isCurrentPlayer)
  );

  // 尋找此槽位中屬於當前玩家且未翻開的卡牌
  const myUnflippedCard = allCards.find(
    (c) =>
      ((currentConnectionId && c.playerId === currentConnectionId) ||
        (c.playerId === topCard?.playerId && isCurrentPlayer)) &&
      !c.flipped
  );

  // 底部玩家名稱標籤 (撞牌時顯示所有參與玩家：例如「你、小華」)
  const bottomPlayerNamesText = hasCollision
    ? Array.from(
        new Set(
          allCards.map((c) =>
            (currentConnectionId && c.playerId === currentConnectionId) ||
            (c.playerId === topCard?.playerId && isCurrentPlayer)
              ? "你"
              : c.playerName || "匿名"
          )
        )
      ).join("、")
    : isCurrentPlayer
    ? "你"
    : topCard?.playerName || "匿名";

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

    // 若該槽位沒有自己的未翻開卡牌，則點擊進行選位
    if (onSelectSlot) {
      onSelectSlot(slotId);
    }
  };

  return (
    <div
      onClick={(e) => handleCardClick(undefined, e)}
      className={`relative group flex flex-col items-center p-1 rounded-2xl cursor-pointer transition-all border touch-manipulation ${
        isSelected
          ? "ring-2 ring-ukiyo-gold bg-ukiyo-gold/15 border-ukiyo-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          : hasCollision
          ? "ring-2 ring-ukiyo-vermillion border-ukiyo-vermillion bg-ukiyo-vermillion/10 shadow-[0_0_18px_rgba(196,43,28,0.5)]"
          : "border-transparent hover:border-ukiyo-foam/20"
      }`}
    >
      {/* 標籤權重化渲染 (權重：撞牌 > 動作提示；每個席位上方最多顯示單一標籤) */}
      {hasCollision ? (
        <div className="absolute -top-3.5 z-50 bg-ukiyo-vermillion text-ukiyo-cream text-[9px] font-serif font-bold px-2 py-0.5 rounded-full shadow-lg border border-ukiyo-cream/40 whitespace-nowrap animate-bounce pointer-events-none">
          {collisionNamesText}
        </div>
      ) : myUnflippedCard && status !== "finished" ? (
        status === "locked" ? (
          <span className="absolute -top-3.5 z-50 text-[9px] font-serif px-1.5 py-0.5 rounded-full shadow bg-ukiyo-surface border border-ukiyo-gold text-ukiyo-gold font-bold pointer-events-none whitespace-nowrap">
            點擊翻牌
          </span>
        ) : !isOwnerLocked ? (
          <span className="absolute -top-3.5 z-50 text-[9px] font-serif px-1.5 py-0.5 rounded-full shadow bg-ukiyo-surface border border-ukiyo-foam/30 text-ukiyo-mist pointer-events-none whitespace-nowrap">
            點擊收回
          </span>
        ) : null
      ) : null}

      {/* 鎖定同意朱紅落款小印章「確」(僅在同意鎖定、未翻牌且未結束時顯示) */}
      {isOwnerLocked && !topCard?.flipped && status !== "finished" && (
        <div
          title="已完成心靈確認"
          className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded ukiyo-seal flex items-center justify-center text-[10px] shadow-md border border-ukiyo-cream/30 font-serif pointer-events-none"
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

      {/* 出牌者標籤 (碰撞時顯示參與的所有玩家，如「你、小華」) */}
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
