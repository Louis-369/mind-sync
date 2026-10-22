"use client";

import React from "react";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { QUICK_REACTIONS } from "../../lib/constants";
import { sound } from "../../lib/soundEngine";

interface PlayerListProps {
  currentConnectionId: string;
  currentPlayerId?: string;
  hostId?: string | null;
  lockedList: string[];
  others: ReadonlyArray<{ connectionId: number; presence?: any }>;
  selfPresence?: any;
  onSendReaction?: (emoji: string) => void;
}

export function PlayerList({
  currentConnectionId,
  currentPlayerId,
  hostId,
  lockedList,
  others,
  selfPresence,
  onSendReaction,
}: PlayerListProps) {
  const playersMap = new Map<
    string,
    {
      connectionId: string;
      playerId: string;
      name: string;
      isSelf: boolean;
      reaction?: { emoji: string; timestamp: number } | null;
    }
  >();

  const selfPId = selfPresence?.playerId || currentPlayerId || currentConnectionId;
  playersMap.set(selfPId, {
    connectionId: currentConnectionId,
    playerId: selfPId,
    name: selfPresence?.playerName || "你",
    isSelf: true,
    reaction: selfPresence?.reaction || null,
  });

  others.forEach((o) => {
    const pId = o.presence?.playerId || String(o.connectionId);
    if (!playersMap.has(pId)) {
      playersMap.set(pId, {
        connectionId: String(o.connectionId),
        playerId: pId,
        name: o.presence?.playerName || `玩家_${o.connectionId}`,
        isSelf: false,
        reaction: o.presence?.reaction || null,
      });
    }
  });

  const allPlayers = Array.from(playersMap.values());
  const now = Date.now();

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-1.5 py-1 px-2 my-0.5 relative z-20">
      {/* 左側：玩家徽章列表 */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {allPlayers.map((p) => {
          const isHost = p.playerId === hostId || p.connectionId === hostId;
          const isLocked = lockedList.includes(p.connectionId) || lockedList.includes(p.playerId);
          const hasRecentReaction = p.reaction && now - p.reaction.timestamp < 3500;

          return (
            <div
              key={p.playerId}
              className={clsx(
                "relative flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-serif border transition-all duration-300 shadow-sm",
                isLocked
                  ? "bg-ukiyo-gold/20 border-ukiyo-gold text-ukiyo-foam shadow-[0_0_12px_rgba(201,169,110,0.3)] font-bold"
                  : "bg-ukiyo-surface/70 border-ukiyo-foam/15 text-ukiyo-mist"
              )}
            >
              {/* 心情氣泡 (浮現動效) */}
              {hasRecentReaction && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-reaction-pop text-base filter drop-shadow">
                  {p.reaction!.emoji}
                </div>
              )}

              {isHost && <Crown className="w-3 h-3 text-ukiyo-gold fill-ukiyo-gold shrink-0" />}

              <span className="truncate max-w-[90px] sm:max-w-[120px]">
                {p.name} {p.isSelf ? "(你)" : ""}
              </span>

              {isLocked ? (
                <div className="w-3.5 h-3.5 rounded ukiyo-seal flex items-center justify-center text-[8px] leading-none shrink-0 font-bold">
                  確
                </div>
              ) : (
                <span className="text-[9px] font-mono font-bold text-ukiyo-gold/80 animate-pulse">
                  思
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 右側：快速心情貼圖列 (即時破冰微互動) */}
      {onSendReaction && (
        <div className="flex items-center gap-1 bg-ukiyo-bg/70 px-2 py-0.5 rounded-full border border-ukiyo-foam/15 shadow-inner">
          <Sparkles className="w-2.5 h-2.5 text-ukiyo-gold shrink-0 hidden sm:block" />
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                sound.playSlotTap();
                onSendReaction(emoji);
              }}
              title={`發送 ${emoji}`}
              className="text-xs sm:text-sm hover:scale-125 active:scale-95 transition-transform p-0.5 cursor-pointer touch-manipulation"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
