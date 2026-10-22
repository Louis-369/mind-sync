"use client";

import React from "react";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "../ui/Card";
import { sound } from "../../lib/soundEngine";

interface PlayerHandProps {
  hand: number[];
  playerName: string;
  onPlayCard: (cardValue: number) => void;
  isLocked?: boolean;
  lockedCount?: number;
  totalPlayers?: number;
  hasBoardCollision?: boolean;
  onToggleLock?: () => void;
  disabled?: boolean;
}

export function PlayerHand({
  hand,
  playerName,
  onPlayCard,
  isLocked = false,
  lockedCount = 0,
  totalPlayers = 1,
  hasBoardCollision = false,
  onToggleLock,
  disabled = false,
}: PlayerHandProps) {
  const hasUnplayedCards = hand.length > 0;
  const isLockDisabled = (disabled || hasBoardCollision || hasUnplayedCards) && !isLocked;

  const getLockStatusText = () => {
    if (hasBoardCollision) return "⚡ 席位重疊，請先讓席";
    if (hasUnplayedCards) return `請先落盡手牌 (尚餘 ${hand.length} 張)`;
    return `全體同意進度: ${lockedCount}/${totalPlayers} 人`;
  };

  const getLockActionLabel = () => {
    if (isLocked) return `已落印「確」 (點擊撤回)`;
    if (hasBoardCollision) return "席位重疊無法落印";
    if (hasUnplayedCards) return "請先落盡手牌";
    return `蓋印定案 (${lockedCount}/${totalPlayers})`;
  };

  const handleCardSelect = (cardValue: number) => {
    if (disabled || isLocked) return;
    sound.playCardSlide();
    onPlayCard(cardValue);
  };

  // 扇形握牌角度與弧線位移演算法 (Arc Fan Layout)
  const totalCards = hand.length;
  const centerIdx = (totalCards - 1) / 2;

  return (
    <div className="w-full my-1.5 flex flex-col items-center justify-center relative z-20">
      {/* 提示訊息膠囊 */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-serif font-black text-ukiyo-gold tracking-wider">
          {playerName}
        </span>
        <span className="text-[10px] text-ukiyo-mist bg-ukiyo-bg/80 px-2 py-0.5 rounded-full border border-ukiyo-foam/15 font-serif">
          {hand.length} 張手牌
        </span>
        <span className={clsx(
          "text-[10px] sm:text-xs font-serif px-3 py-1 rounded-full border shadow-sm transition-all flex items-center gap-1.5",
          hasBoardCollision
            ? "bg-ukiyo-vermillion/20 border-ukiyo-vermillion text-ukiyo-vermillion font-bold animate-pulse"
            : isLocked
            ? "bg-ukiyo-gold/15 border-ukiyo-gold text-ukiyo-gold font-bold"
            : "bg-ukiyo-bg/80 border-ukiyo-foam/15 text-ukiyo-mist"
        )}>
          {hasBoardCollision && <AlertTriangle className="w-3 h-3 text-ukiyo-vermillion" />}
          {getLockStatusText()}
        </span>
      </div>

      {/* 底部中央：無框扇形手牌區 (Arc Fan Deck) */}
      <div className="relative flex items-end justify-center min-h-[110px] sm:min-h-[125px] w-full max-w-xl py-2 px-2 overflow-visible">
        {hand.length === 0 ? (
          <div className="text-xs text-ukiyo-foam/80 font-serif py-3 px-6 rounded-2xl bg-ukiyo-surface/80 border border-ukiyo-gold/30 text-center animate-fade-in shadow-xl flex items-center gap-2">
            <span className="text-ukiyo-gold font-bold">✨ 手牌已完全出完！</span>
            <span>請點擊下方朱印鎖定，等待同伴揭牌。</span>
          </div>
        ) : (
          hand.map((cardValue, idx) => {
            // 依相對於中心點的位置計算旋轉角與 Y 軸弧線位移
            const offsetFromCenter = idx - centerIdx;
            const rotateDeg = totalCards > 1 ? offsetFromCenter * 5 : 0;
            const translateYPx = totalCards > 1 ? Math.abs(offsetFromCenter) * 4 : 0;

            return (
              <div
                key={cardValue}
                style={{
                  transform: `translateY(${translateYPx}px) rotate(${rotateDeg}deg)`,
                  marginLeft: idx > 0 ? (totalCards > 4 ? "-16px" : "-8px") : "0px",
                  zIndex: idx + 10,
                }}
                className="transition-all duration-300 hover:z-30 hover:-translate-y-5"
              >
                <Card
                  value={cardValue}
                  flipped={true} // 自己看得到數值
                  isOwner={true}
                  showSeal={isLocked}
                  onClick={() => handleCardSelect(cardValue)}
                />
              </div>
            );
          })
        )}
      </div>

      {/* 底部鎖定操作列：日式朱紅印章「確」實體按鈕 */}
      {onToggleLock && (
        <div className="mt-2 flex items-center justify-center">
          <button
            onClick={() => {
              if (isLockDisabled) {
                sound.playCollisionAlert();
                return;
              }
              onToggleLock();
            }}
            disabled={isLockDisabled}
            className={clsx(
              "px-5 py-2.5 rounded-2xl font-serif text-xs sm:text-sm font-bold tracking-widest transition-all duration-300 shadow-xl flex items-center gap-2 touch-manipulation active:scale-95 cursor-pointer",
              isLocked
                ? "bg-ukiyo-vermillion text-ukiyo-cream border-2 border-ukiyo-cream/60 shadow-[0_0_20px_rgba(199,62,29,0.7)]"
                : isLockDisabled
                ? "bg-ukiyo-surface/60 border border-ukiyo-foam/10 text-ukiyo-mist/60 cursor-not-allowed opacity-60"
                : "bg-ukiyo-gold text-ukiyo-bg border-2 border-ukiyo-cream/40 hover:bg-ukiyo-cream shadow-[0_0_20px_rgba(201,169,110,0.5)] animate-pulse"
            )}
          >
            {isLocked ? (
              <>
                <div className="w-5 h-5 rounded ukiyo-seal flex items-center justify-center text-[10px] leading-none border border-ukiyo-cream/40">
                  確
                </div>
                <span>{getLockActionLabel()}</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-ukiyo-bg" />
                <span>{getLockActionLabel()}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
