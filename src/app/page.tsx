"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { NameInput } from "../components/lobby/NameInput";
import { EmojiPicker } from "../components/lobby/EmojiPicker";
import { TutorialModal } from "../components/lobby/TutorialModal";
import { Button } from "../components/ui/Button";
import { AsciiWaveCanvas } from "../components/ui/AsciiWaveCanvas";
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
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative overflow-hidden bg-[#0d1b2a] text-slate-100">
      {/* 互動波點陣列 */}
      <AsciiWaveCanvas active={true} />

      {/* 大廳主面板 (現代和風深邃金箔面板) */}
      <div className="w-full max-w-lg bg-[#132238]/90 border border-[#d4af37]/40 rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] relative z-10 flex flex-col items-center text-center">
        {/* 頂部圖標徽章 */}
        <div className="w-16 h-16 rounded-2xl bg-[#0d1b2a] border border-[#d4af37]/50 flex items-center justify-center text-2xl font-black mb-4 shadow-md text-[#d4af37]">
          心
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white tracking-wider mb-1">
          心天秤
        </h1>
        <p className="text-xs font-mono font-black text-[#d4af37] tracking-[0.25em] uppercase mb-3">
          MIND SYNC
        </p>

        <p className="text-xs sm:text-sm text-slate-300 mb-5 max-w-sm leading-relaxed font-medium">
          不能說出數字，只能用形容詞溝通。你們能把牌由小到大排好嗎？
        </p>

        {/* 玩法教學按鈕 */}
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="mb-5 px-4 py-1.5 rounded-full bg-[#0d1b2a]/90 border border-[#d4af37]/40 text-slate-200 text-xs font-bold hover:bg-[#1a2e46] hover:border-[#d4af37] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>30 秒玩法說明</span>
        </button>

        {/* 表單區域 */}
        <div className="w-full space-y-4 flex flex-col items-center">
          {/* 暱稱輸入 */}
          <NameInput name={playerName} onChange={setPlayerName} />

          {/* Emoji 房間暗號 */}
          <EmojiPicker onRoomSelect={setSelectedRoomId} />

          {/* 進入房間按鈕 */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleEnterRoom}
            className="w-full max-w-xs mt-3 group font-black tracking-wider"
          >
            <span className="flex items-center justify-center gap-2 text-slate-950 font-bold">
              <Sparkles className="w-4 h-4 text-slate-950" /> 進入房間
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        {/* 底部說明三步卡 */}
        <div className="mt-7 pt-5 border-t border-slate-700/60 w-full text-left">
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="bg-[#0d1b2a]/80 p-3 rounded-2xl border border-slate-700/60 flex flex-col items-center shadow-sm">
              <span className="text-xs font-bold text-[#d4af37] mb-1">① 抽出題目</span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">不說出數字<br />只用言語形容</span>
            </div>
            <div className="bg-[#0d1b2a]/80 p-3 rounded-2xl border border-slate-700/60 flex flex-col items-center shadow-sm">
              <span className="text-xs font-bold text-[#d4af37] mb-1">② 出牌排順序</span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">憑默契 1~100<br />由小到大排好</span>
            </div>
            <div className="bg-[#0d1b2a]/80 p-3 rounded-2xl border border-slate-700/60 flex flex-col items-center shadow-sm">
              <span className="text-xs font-bold text-[#d4af37] mb-1">③ 翻牌看結果</span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">全員鎖定翻開<br />順序全對過關</span>
            </div>
          </div>
        </div>
      </div>

      {/* 玩法教學彈窗 */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </main>
  );
}
