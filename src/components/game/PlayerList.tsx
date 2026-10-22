"use client";

import React from "react";
import { Crown } from "lucide-react";
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
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-1.5 py-1 px-1 my-0.5 relative z-20 text-xs">
      {/* 玩家列表 */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {allPlayers.map((p) => {
          const isHost = p.playerId === hostId || p.connectionId === hostId;
          const isLocked = lockedList.includes(p.connectionId) || lockedList.includes(p.playerId);
          const hasRecentReaction = p.reaction && now - p.reaction.timestamp < 3500;

          return (
            <div
              key={p.playerId}
              className={clsx(
                "relative flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all duration-200",
                isLocked
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                  : "bg-slate-800/80 border-slate-700 text-slate-300"
              )}
            >
              {hasRecentReaction && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-reaction-pop text-base filter drop-shadow">
                  {p.reaction!.emoji}
                </div>
              )}

              {isHost && <Crown className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b] shrink-0" />}

              <span className="truncate max-w-[90px] sm:max-w-[120px]">
                {p.name} {p.isSelf ? "(我)" : ""}
              </span>

              {isLocked ? (
                <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-bold">
                  已鎖定
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">
                  思考中...
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 快速反應氣泡 */}
      {onSendReaction && (
        <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                sound.playSlotTap();
                onSendReaction(emoji);
              }}
              title={`發送 ${emoji}`}
              className="text-xs sm:text-sm hover:scale-125 active:scale-95 transition-transform p-0.5 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
