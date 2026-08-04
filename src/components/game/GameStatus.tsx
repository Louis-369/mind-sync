"use client";

import React, { useState } from "react";
import { Users, Copy, Check, Settings } from "lucide-react";

interface GameStatusProps {
  roomId: string;
  connectedCount: number;
  maxPlayers: number;
  isHost?: boolean;
  onOpenHostPanel?: () => void;
}

export function GameStatus({
  roomId,
  connectedCount,
  maxPlayers,
  isHost = false,
  onOpenHostPanel,
}: GameStatusProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("複製房間網址失敗:", error);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl px-3 md:px-4 py-2.5 mb-2 flex items-center justify-between gap-2 border-ukiyo-foam/15 shadow-lg">
      {/* 左側：房間代碼與一鍵複製 */}
      <div className="flex items-center space-x-1.5">
        <div className="flex items-center space-x-1.5 bg-ukiyo-surface/80 px-2.5 py-1 rounded-lg border border-ukiyo-foam/15">
          <span className="text-sm md:text-base font-bold text-ukiyo-gold font-mono">{roomId}</span>
          <button
            onClick={handleCopyLink}
            title="複製邀請連結"
            className="text-ukiyo-mist hover:text-ukiyo-foam transition-colors p-0.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 右側：人數與房主 ⚙ 按鈕 */}
      <div className="flex items-center space-x-3 text-xs font-serif">
        {/* 人數 */}
        <div className="flex items-center space-x-1 text-ukiyo-foam bg-ukiyo-surface/80 px-2.5 py-1 rounded-full border border-ukiyo-foam/10">
          <Users className="w-3.5 h-3.5 text-ukiyo-gold" />
          <span className="font-sans text-xs font-semibold">{`${connectedCount}/${maxPlayers}`} 人席</span>
        </div>

        {/* 房主齒輪設定按鈕 */}
        {isHost && onOpenHostPanel && (
          <button
            onClick={onOpenHostPanel}
            title="房主設定"
            className="p-1.5 rounded-lg bg-ukiyo-indigo/80 hover:bg-ukiyo-indigo text-ukiyo-foam border border-ukiyo-foam/20 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
