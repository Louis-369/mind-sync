"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
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
      {/* 背景浮世繪深海波浪暈光 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ukiyo-wave/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-ukiyo-gold/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 主面板容器 */}
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-10 border border-ukiyo-foam/20 shadow-2xl relative z-10 flex flex-col items-center text-center">
        {/* 日式硃砂圓圖騰 */}
        <div className="w-14 h-14 rounded-full ukiyo-seal flex items-center justify-center text-2xl font-serif mb-4 shadow-lg animate-wave-float">
          心
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-black text-ukiyo-foam tracking-widest mb-1">
          心秤
        </h1>
        <p className="text-xs md:text-sm font-sans font-medium text-ukiyo-gold/80 tracking-[0.25em] uppercase mb-4">
          Kokoro Tenbin
        </p>

        <p className="text-xs md:text-sm text-ukiyo-mist mb-8 max-w-sm leading-relaxed font-serif">
          透過言語構築，在心的天秤上取得平衡，最純粹的默契卡牌遊戲。
        </p>

        {/* 表單區域 (使用 div 避免使用 HTML form) */}
        <div className="w-full space-y-6 flex flex-col items-center">
          {/* 暱稱輸入 */}
          <NameInput name={playerName} onChange={setPlayerName} />

          {/* Emoji 房間選擇器 */}
          <EmojiPicker onRoomSelect={setSelectedRoomId} />

          {/* 進入遊戲按鈕 */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleEnterRoom}
            className="w-full max-w-xs mt-4 group"
          >
            <span className="flex items-center justify-center gap-2 font-serif tracking-widest">
              <Sparkles className="w-4 h-4 text-ukiyo-gold" /> 入座牌席
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        {/* 遊戲說明引導 */}
        <div className="mt-8 pt-6 border-t border-ukiyo-foam/10 w-full text-left">
          <h4 className="text-xs font-serif font-bold text-ukiyo-gold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ukiyo-gold" /> 默契法則
          </h4>
          <ul className="text-xs text-ukiyo-mist space-y-2 font-serif">
            <li className="flex items-start gap-1.5">
              <span className="text-ukiyo-gold font-bold shrink-0">☯️ 以心入座：</span>
              <span>輸入相同 Emoji 暗號入座</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-ukiyo-gold font-bold shrink-0">🌊 默契落牌：</span>
              <span>選位暗出手牌，由小至大流暢排列</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-ukiyo-gold font-bold shrink-0">⚡ 碰撞應變：</span>
              <span>重疊撞牌時，及時收回調頻</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-ukiyo-gold font-bold shrink-0">🌸 心印結算：</span>
              <span>手牌清空全員鎖定，翻牌印證默契</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
