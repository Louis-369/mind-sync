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
    <div className="w-full glass-card rounded-xl p-2.5 border border-ukiyo-foam/10 mb-2">
      <h3 className="text-[11px] font-serif tracking-widest text-ukiyo-mist font-bold mb-1.5 flex items-center gap-1">
        <User className="w-3.5 h-3.5 text-ukiyo-gold" /> 同席同伴 ({allPlayers.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {allPlayers.map((p) => {
          const isHost = p.connectionId === hostId;
          const isLocked = lockedList.includes(p.connectionId);

          return (
            <div
              key={p.connectionId}
              className={clsx(
                "flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-serif border transition-all",
                isLocked
                  ? "bg-ukiyo-wave/80 border-ukiyo-gold/40 text-ukiyo-foam shadow-md"
                  : "bg-ukiyo-surface/60 border-ukiyo-foam/10 text-ukiyo-mist"
              )}
            >
              {isHost && <Crown className="w-3.5 h-3.5 text-ukiyo-gold fill-ukiyo-gold" />}
              <span>{p.name} {p.isSelf ? "(你)" : ""}</span>
              {isLocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
