"use client";

import React from "react";
import { CheckCircle2, Crown, User } from "lucide-react";
import { clsx } from "clsx";

interface PlayerListProps {
  currentConnectionId: string;
  hostId?: string | null;
  lockedList: string[];
  others: ReadonlyArray<{ connectionId: number; presence?: any }>;
  selfPresence?: any;
}

export function PlayerList({
  currentConnectionId,
  hostId,
  lockedList,
  others,
  selfPresence,
}: PlayerListProps) {
  const allPlayers = [
    {
      connectionId: currentConnectionId,
      name: selfPresence?.playerName || "你",
      isSelf: true,
    },
    ...others.map((o) => ({
      connectionId: String(o.connectionId),
      name: o.presence?.playerName || `玩家_${o.connectionId}`,
      isSelf: false,
    })),
  ];

  return (
    <div className="w-full glass-card rounded-xl p-3 border border-white/10 mb-4">
      <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2 flex items-center gap-1">
        <User className="w-3.5 h-3.5 text-poker-accent" /> 線上玩家列表 ({allPlayers.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {allPlayers.map((p) => {
          const isHost = p.connectionId === hostId;
          const isLocked = lockedList.includes(p.connectionId);

          return (
            <div
              key={p.connectionId}
              className={clsx(
                "flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                isLocked
                  ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-glow-gold"
                  : "bg-poker-bg/60 border-white/10 text-gray-300"
              )}
            >
              {isHost && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              <span>{p.name} {p.isSelf ? "(你)" : ""}</span>
              {isLocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
