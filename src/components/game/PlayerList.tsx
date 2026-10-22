"use client";

import React from "react";
import { Terminal } from "lucide-react";
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
    name: selfPresence?.playerName || "YOU",
    isSelf: true,
    reaction: selfPresence?.reaction || null,
  });

  others.forEach((o) => {
    const pId = o.presence?.playerId || String(o.connectionId);
    if (!playersMap.has(pId)) {
      playersMap.set(pId, {
        connectionId: String(o.connectionId),
        playerId: pId,
        name: o.presence?.playerName || `OP_${o.connectionId}`,
        isSelf: false,
        reaction: o.presence?.reaction || null,
      });
    }
  });

  const allPlayers = Array.from(playersMap.values());
  const now = Date.now();

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-1 py-1 px-1 my-0.5 relative z-20 font-mono text-xs">
      {/* 特工列表 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {allPlayers.map((p) => {
          const isHost = p.playerId === hostId || p.connectionId === hostId;
          const isLocked = lockedList.includes(p.connectionId) || lockedList.includes(p.playerId);
          const hasRecentReaction = p.reaction && now - p.reaction.timestamp < 3500;

          return (
            <div
              key={p.playerId}
              className={clsx(
                "relative flex items-center space-x-1.5 px-2 py-0.5 text-[11px] border transition-all duration-200",
                isLocked
                  ? "bg-[#00ff9d]/20 border-[#00ff9d] text-[#00ff9d] font-bold shadow-[0_0_10px_rgba(0,255,157,0.3)]"
                  : "bg-black/60 border-[#00ff9d]/30 text-[#00ff9d]/70"
              )}
            >
              {hasRecentReaction && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-reaction-pop text-base filter drop-shadow">
                  {p.reaction!.emoji}
                </div>
              )}

              {isHost && <span className="text-[#ffb000] font-black">[ROOT]</span>}

              <span className="truncate max-w-[90px] sm:max-w-[120px]">
                {p.name} {p.isSelf ? "(ME)" : ""}
              </span>

              {isLocked ? (
                <span className="text-[9px] bg-[#ff0055] text-white px-1 leading-none font-bold">
                  LOCKED
                </span>
              ) : (
                <span className="text-[9px] text-[#00e5ff] animate-pulse">
                  ...
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 快速反應氣泡 */}
      {onSendReaction && (
        <div className="flex items-center gap-1 bg-black/80 px-2 py-0.5 border border-[#00ff9d]/30">
          <Terminal className="w-2.5 h-2.5 text-[#00e5ff] shrink-0 hidden sm:block" />
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
