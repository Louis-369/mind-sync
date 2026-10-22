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
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 relative overflow-hidden bg-[#090b0e] text-[#f8fafc]">
      {/* 互動 ASCII 字符海浪 (平時低調深藍灰，滑鼠游標激發金色漣漪) */}
      <AsciiWaveCanvas active={true} />

      {/* 大廳主面板 (實心深灰高對比底色，確保文字乾淨銳利) */}
      <div className="w-full max-w-lg bg-[#12161f] border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col items-center text-center">
        {/* 頂部圖騰徽章 */}
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-[#f59e0b] flex items-center justify-center text-2xl font-bold mb-4 shadow-md text-[#f59e0b]">
          心
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider mb-1 drop-shadow-sm">
          心天秤
        </h1>
        <p className="text-xs font-mono font-bold text-[#f59e0b] tracking-[0.25em] uppercase mb-3">
          MIND SYNC
        </p>

        <p className="text-xs sm:text-sm text-slate-300 mb-5 max-w-sm leading-relaxed">
          禁言數字，只談價值。你們的心，能排成一線嗎？
        </p>

        {/* 玩法教學引導按鈕 */}
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="mb-5 px-3.5 py-1.5 rounded-full bg-slate-800 border border-[#f59e0b]/40 text-[#f59e0b] text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>30 秒上手指南</span>
        </button>

        {/* 表單區域 */}
        <div className="w-full space-y-5 flex flex-col items-center">
          {/* 暱稱輸入 */}
          <NameInput name={playerName} onChange={setPlayerName} />

          {/* Emoji 房間暗號 */}
          <EmojiPicker onRoomSelect={setSelectedRoomId} />

          {/* 進入房間按鈕 */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleEnterRoom}
            className="w-full max-w-xs mt-3 group font-bold tracking-wider"
          >
            <span className="flex items-center justify-center gap-2 text-black">
              <Sparkles className="w-4 h-4 text-black" /> 對暗號 ‧ 掀簾入座
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        {/* 底部說明三步卡 */}
        <div className="mt-7 pt-5 border-t border-slate-800 w-full text-left">
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex flex-col items-center">
              <span className="text-xs font-bold text-[#f59e0b] mb-1">① 展卷抽題</span>
              <span className="text-[10px] text-slate-400 leading-tight">不說數字<br />只聊真實想法</span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex flex-col items-center">
              <span className="text-xs font-bold text-[#f59e0b] mb-1">② 暗出心證</span>
              <span className="text-[10px] text-slate-400 leading-tight">憑直覺 1~100<br />由小至大落席</span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex flex-col items-center">
              <span className="text-xs font-bold text-[#f59e0b] mb-1">③ 翻牌共鳴</span>
              <span className="text-[10px] text-slate-400 leading-tight">全員鎖定揭牌<br />完全遞增勝利</span>
            </div>
          </div>
        </div>
      </div>

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </main>
  );
}
