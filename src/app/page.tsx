"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Brain, ArrowRight } from "lucide-react";
import { NameInput } from "../components/lobby/NameInput";
import { EmojiPicker } from "../components/lobby/EmojiPicker";
import { Button } from "../components/ui/Button";
import { usePlayerId } from "../hooks/usePlayerId";

export default function LobbyPage() {
  const router = useRouter();
  const { playerName, setPlayerName } = usePlayerId();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("🐶-🚀-🍎");

  const handleEnterRoom = () => {
    try {
      if (!selectedRoomId) return;
      router.push(`/room?id=${encodeURIComponent(selectedRoomId)}`);
    } catch (error) {
      console.error("跳轉房間失敗:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* 背景霓虹光罩 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* 主面板容器 */}
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-10 border-2 border-poker-accent/40 shadow-2xl relative z-10 flex flex-col items-center text-center">
        {/* 遊戲 Header */}
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-10 h-10 text-poker-accent animate-pulse-glow" />
          <span className="text-xs uppercase tracking-widest text-poker-accent font-bold bg-poker-accent/10 px-3 py-1 rounded-full border border-poker-accent/30">
            Liveblocks 即時連線
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-poker-accent to-yellow-400 tracking-tight mb-3">
          心靈同步
        </h1>

        <p className="text-sm text-gray-300 mb-8 max-w-sm leading-relaxed">
          不發一言，零語音、零文字。透過極致的心靈感應與默契，合作將數字從小到大打出！
        </p>

        {/* 表單區域 (使用 div 避免使用 HTML form) */}
        <div className="w-full space-y-6 flex flex-col items-center">
          {/* 暱稱輸入 */}
          <NameInput name={playerName} onChange={setPlayerName} />

          {/* Emoji 房間選擇器 */}
          <EmojiPicker onRoomSelect={setSelectedRoomId} />

          {/* 進入遊戲按鈕 */}
          <Button
            variant="gold"
            size="lg"
            onClick={handleEnterRoom}
            className="w-full max-w-xs mt-4 group"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> 進入心靈牌桌
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        {/* 遊戲說明引導 */}
        <div className="mt-8 pt-6 border-t border-white/10 w-full text-left">
          <h4 className="text-xs font-bold text-poker-accent uppercase tracking-wider mb-2">
            遊玩規則簡介:
          </h4>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>選擇或加入相同的 3 個 Emoji 暗號房間</li>
            <li>所有人拿牌後，憑感覺打出最小的牌</li>
            <li>確認沒牌後全員按「認可鎖定」，最後翻牌結算</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
