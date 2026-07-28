"use client";

import React from "react";
import { CheckCircle2, Crown, User } from "lucide-react";
import { clsx } from "clsx";

interface PlayerListProps {
  currentConnectionId: string;
  currentPlayerId?: string;
  hostId?: string | null;
  lockedList: string[];
  others: ReadonlyArray<{ connectionId: number; presence?: any }>;
  selfPresence?: any;
}

export function PlayerList({
  currentConnectionId,
  currentPlayerId,
  hostId,
  lockedList,
  others,
  selfPresence,
}: PlayerListProps) {
  // 對所有線上玩家建立 Map（依據 unique playerId 去重，避免顯示影子連線）
  const playersMap = new Map<string, { connectionId: string; playerId: string; name: string; isSelf: boolean }>();

  const selfPId = selfPresence?.playerId || currentPlayerId || currentConnectionId;
  playersMap.set(selfPId, {
    connectionId: currentConnectionId,
    playerId: selfPId,
    name: selfPresence?.playerName || "你",
    isSelf: true,
  });

  others.forEach((o) => {
    const pId = o.presence?.playerId || String(o.connectionId);
    if (!playersMap.has(pId)) {
      playersMap.set(pId, {
        connectionId: String(o.connectionId),
        playerId: pId,
        name: o.presence?.playerName || `玩家_${o.connectionId}`,
        isSelf: false,
      });
    }
  });

  const allPlayers = Array.from(playersMap.values());

  return (
    <div className="w-full glass-card rounded-xl p-2.5 border border-ukiyo-foam/10 mb-2">
      <h3 className="text-[11px] font-serif tracking-widest text-ukiyo-mist font-bold mb-1.5 flex items-center gap-1">
        <User className="w-3.5 h-3.5 text-ukiyo-gold" /> 同席同伴 ({allPlayers.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {allPlayers.map((p) => {
          const isHost = p.playerId === hostId || p.connectionId === hostId;
          const isLocked = lockedList.includes(p.connectionId) || lockedList.includes(p.playerId);

          return (
            <div
              key={p.playerId}
              className={clsx(
                "flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-serif border transition-all",
                isLocked
                  ? "bg-ukiyo-wave/80 border-ukiyo-gold/40 text-ukiyo-foam shadow-md"
                  : "bg-ukiyo-surface/60 border-ukiyo-foam/10 text-ukiyo-mist"
              )}
            >
              {isHost && <Crown className="w-3.5 h-3.5 text-ukiyo-gold fill-ukiyo-gold" />}
              <span>
                {p.name} {p.isSelf ? "(你)" : ""}
              </span>
              {isLocked ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-[10px] font-mono font-bold text-ukiyo-gold/90 animate-pulse">...</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
