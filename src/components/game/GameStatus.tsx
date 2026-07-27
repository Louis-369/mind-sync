"use client";

import React, { useState } from "react";
import { Heart, Sparkles, Users, Copy, Check } from "lucide-react";

interface GameStatusProps {
  roomId: string;
  lives: number;
  shurikens: number;
  currentLevel: number;
  connectedCount: number;
  maxPlayers: number;
  onUseShuriken?: () => void;
  canUseShuriken?: boolean;
}

export function GameStatus({
  roomId,
  lives,
  shurikens,
  currentLevel,
  connectedCount,
  maxPlayers,
  onUseShuriken,
  canUseShuriken = false,
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
    <div className="w-full glass-panel rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4 border-amber-500/30">
      {/* 房間 ID 資訊 與 一鍵複製 */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-400 font-mono">房間代碼:</span>
        <div className="flex items-center space-x-1.5 bg-poker-bg/60 px-3 py-1 rounded-lg border border-poker-accent/30">
          <span className="text-base md:text-lg font-bold text-poker-neonGold">{roomId}</span>
          <button
            onClick={handleCopyLink}
            title="複製房間邀請連結"
            className="ml-1 text-gray-400 hover:text-poker-accent transition-colors flex items-center gap-1 text-xs"
          >
            {copied ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <Check className="w-3.5 h-3.5" /> 已複製網址
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 核心數據統計 */}
      <div className="flex items-center space-x-6">
        {/* 生命值 */}
        <div className="flex items-center space-x-1.5" title="團隊生命值">
          <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
          <span className="text-lg font-bold text-white">{lives}</span>
        </div>

        {/* 手裏劍 */}
        <div className="flex items-center space-x-1.5" title="手裏劍 (集體丟棄最小牌)">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span className="text-lg font-bold text-white">{shurikens}</span>
          {canUseShuriken && (
            <button
              onClick={onUseShuriken}
              className="ml-2 text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 px-2 py-1 rounded border border-amber-400/40 transition-colors"
            >
              發動手裏劍
            </button>
          )}
        </div>

        {/* 關卡 */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-400 uppercase">Level</span>
          <span className="text-xl font-black text-poker-accent">{currentLevel}</span>
        </div>

        {/* 人數 */}
        <div className="flex items-center space-x-1 text-gray-300">
          <Users className="w-4 h-4 text-poker-accent" />
          <span className="text-sm font-semibold">{`${connectedCount}/${maxPlayers}`}</span>
        </div>
      </div>
    </div>
  );
}
