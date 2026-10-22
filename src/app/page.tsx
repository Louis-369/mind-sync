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
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative overflow-hidden bg-[#f5f2eb] text-[#18181b]">
      {/* 互動波點陣列 */}
      <AsciiWaveCanvas active={true} />

      {/* 大廳主面板 (立體玩具厚面板) */}
      <div className="w-full max-w-lg bg-[#ffffff] border-2 border-[#18181b] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#18181b] relative z-10 flex flex-col items-center text-center">
        {/* 頂部圖標徽章 */}
        <div className="w-16 h-16 rounded-2xl bg-[#fef3c7] border-2 border-[#18181b] flex items-center justify-center text-2xl font-black mb-4 shadow-[3px_3px_0px_#18181b] text-[#f59e0b]">
          心
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-[#18181b] tracking-wider mb-1">
          心天秤
        </h1>
        <p className="text-xs font-mono font-black text-[#f59e0b] tracking-[0.25em] uppercase mb-3">
          MIND SYNC
        </p>

        <p className="text-xs sm:text-sm text-slate-600 mb-5 max-w-sm leading-relaxed font-bold">
          不能說出數字，只能用形容詞溝通。你們能把牌由小到大排好嗎？
        </p>

        {/* 玩法教學按鈕 */}
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="mb-5 px-4 py-1.5 rounded-full bg-[#f4f1ea] border-2 border-[#18181b] text-[#18181b] text-xs font-black hover:bg-[#e7e1d5] transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#18181b] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
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
            <span className="flex items-center justify-center gap-2 text-[#18181b]">
              <Sparkles className="w-4 h-4 text-[#18181b]" /> 進入房間
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        {/* 底部說明三步卡 */}
        <div className="mt-7 pt-5 border-t-2 border-slate-100 w-full text-left">
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="bg-[#f4f1ea] p-3 rounded-2xl border-2 border-[#18181b] flex flex-col items-center shadow-[2px_2px_0px_#18181b]">
              <span className="text-xs font-black text-[#f59e0b] mb-1">① 抽出題目</span>
              <span className="text-[10px] text-slate-600 font-bold leading-tight">不說出數字<br />只用言語形容</span>
            </div>
            <div className="bg-[#f4f1ea] p-3 rounded-2xl border-2 border-[#18181b] flex flex-col items-center shadow-[2px_2px_0px_#18181b]">
              <span className="text-xs font-black text-[#f59e0b] mb-1">② 出牌排順序</span>
              <span className="text-[10px] text-slate-600 font-bold leading-tight">憑默契 1~100<br />由小到大排好</span>
            </div>
            <div className="bg-[#f4f1ea] p-3 rounded-2xl border-2 border-[#18181b] flex flex-col items-center shadow-[2px_2px_0px_#18181b]">
              <span className="text-xs font-black text-[#f59e0b] mb-1">③ 翻牌看結果</span>
              <span className="text-[10px] text-slate-600 font-bold leading-tight">全員鎖定翻開<br />順序全對過關</span>
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
