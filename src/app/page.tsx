"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { NameInput } from "../components/lobby/NameInput";
import { EmojiPicker } from "../components/lobby/EmojiPicker";
import { TutorialModal } from "../components/lobby/TutorialModal";
import { Button } from "../components/ui/Button";
import { usePlayerId } from "../hooks/usePlayerId";

export default function LobbyPage() {
  const router = useRouter();
  const { playerName, setPlayerName } = usePlayerId();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("🐶-🚀-🍎");
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

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

      {/* 浮世繪風格底部波浪紋裝飾 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-15 pointer-events-none bg-repeat-x bg-bottom" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z' fill='%23c9a96e'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: '800px 120px'
      }} />

      {/* 主面板容器 */}
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-10 border border-ukiyo-foam/20 shadow-2xl relative z-10 flex flex-col items-center text-center">
        {/* 日式硃砂圓圖騰 */}
        <div className="w-14 h-14 rounded-full ukiyo-seal flex items-center justify-center text-2xl font-serif mb-4 shadow-lg animate-wave-float border border-ukiyo-foam/30">
          <span className="animate-tenbin-sway leading-none select-none">
            心
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-black text-ukiyo-foam tracking-widest mb-1 drop-shadow-md">
          心天秤
        </h1>
        <p className="text-xs md:text-sm font-sans font-medium text-ukiyo-gold/90 tracking-[0.25em] uppercase mb-4">
          Kokoro Tenbin
        </p>

        <p className="text-xs md:text-sm text-ukiyo-mist mb-6 max-w-sm leading-relaxed font-serif">
          禁言數字，只談價值。你們的心，能排成一線嗎？
        </p>

        {/* 遊戲教學按鈕 */}
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="mb-6 px-3.5 py-1.5 rounded-full bg-ukiyo-surface/80 border border-ukiyo-gold/40 text-ukiyo-gold text-xs font-serif font-bold hover:bg-ukiyo-gold/15 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-ukiyo-gold" />
          <span>🌸 30 秒上手指南</span>
        </button>

        {/* 表單區域 */}
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
            <span className="flex items-center justify-center gap-2 font-serif tracking-widest font-bold">
              <Sparkles className="w-4 h-4 text-ukiyo-gold" /> 對暗號 ‧ 掀簾入座
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        {/* 遊戲說明引導三步微縮卡 */}
        <div className="mt-8 pt-6 border-t border-ukiyo-foam/10 w-full text-left">
          <div className="grid grid-cols-3 gap-2 text-center font-serif">
            <div className="bg-ukiyo-bg/60 p-2.5 rounded-xl border border-ukiyo-foam/10 flex flex-col items-center">
              <span className="text-xs font-bold text-ukiyo-gold mb-1">① 展卷抽題</span>
              <span className="text-[10px] text-ukiyo-mist leading-tight">不說數字<br />只聊真實想法</span>
            </div>
            <div className="bg-ukiyo-bg/60 p-2.5 rounded-xl border border-ukiyo-foam/10 flex flex-col items-center">
              <span className="text-xs font-bold text-ukiyo-gold mb-1">② 暗出心證</span>
              <span className="text-[10px] text-ukiyo-mist leading-tight">憑直覺 1~100<br />由小至大落席</span>
            </div>
            <div className="bg-ukiyo-bg/60 p-2.5 rounded-xl border border-ukiyo-foam/10 flex flex-col items-center">
              <span className="text-xs font-bold text-ukiyo-gold mb-1">③ 揭牌見真章</span>
              <span className="text-[10px] text-ukiyo-mist leading-tight">落印「確」<br />見證心靈同步率</span>
            </div>
          </div>
        </div>
      </div>

      {/* 互動式詳細規則教學彈窗 */}
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
    </main>
  );
}
