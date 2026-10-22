"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Shield, ArrowRight, HelpCircle } from "lucide-react";
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
    <main className="flex flex-col items-center justify-center min-h-screen p-3 md:p-6 relative overflow-hidden font-mono bg-[#030609] text-[#00ff9d]">
      {/* 60fps 賽博矩陣 ASCII 字符海浪畫布 */}
      <AsciiWaveCanvas active={true} />

      {/* 終端登入主視窗 */}
      <div className="w-full max-w-lg bg-[#030609]/95 border-2 border-[#00ff9d] p-5 md:p-8 shadow-[0_0_35px_rgba(0,255,157,0.25)] relative z-10 flex flex-col items-center text-center">
        {/* 四角準星錨點 */}
        <div className="absolute top-1 left-1.5 text-[9px] text-[#00ff9d]">+</div>
        <div className="absolute top-1 right-1.5 text-[9px] text-[#00ff9d]">+</div>
        <div className="absolute bottom-1 left-1.5 text-[9px] text-[#00ff9d]">+</div>
        <div className="absolute bottom-1 right-1.5 text-[9px] text-[#00ff9d]">+</div>

        {/* 頂部 ASCII Art Banner */}
        <pre className="text-[7.5px] sm:text-[9.5px] md:text-[11px] leading-[1.1] text-[#00ff9d] font-black select-none whitespace-pre text-left drop-shadow-[0_0_8px_#00ff9d] mb-2">
{` __  __ ___ _  _ ___     ______   ___  _  ___ 
|  \\/  |_ _| \\| |   \\   / ___\\ \\ / / \\| |/ __|
| |\\/| || || .\` | |) |  \\__ \\ \\ V /| .\` | (__ 
|_|  |_|___|_|\\_|___/   |___/  |_| |_|\\_|\\___|`}
        </pre>

        <div className="flex items-center gap-2 text-xs text-[#00e5ff] tracking-widest font-bold mb-3 border-b border-[#00ff9d]/30 pb-2 w-full justify-center">
          <Terminal className="w-3.5 h-3.5" />
          <span>NEURAL FREQUENCY SYNC PROTOCOL v2.6</span>
        </div>

        {/* 自檢 Log */}
        <div className="w-full text-left text-[10px] text-[#00ff9d]/70 bg-black/80 p-2 border border-[#00ff9d]/20 mb-4 space-y-0.5">
          <div>&gt; INITIALIZING NEURAL LINK... [OK]</div>
          <div>&gt; SECURITY CIPHER: 256-BIT FREQUENCY SYNC</div>
          <div>&gt; RULE: ZERO DIRECT VALUE LEAKAGE, PURE INTUITION</div>
        </div>

        {/* 協定操作說明按鈕 */}
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="mb-4 px-3 py-1 bg-black/80 border border-[#00e5ff]/60 text-[#00e5ff] text-xs font-bold hover:bg-[#00e5ff]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>[VIEW_PROTOCOL_GUIDE // 上手指南]</span>
        </button>

        {/* 表單區域 */}
        <div className="w-full space-y-5 flex flex-col items-center">
          {/* 特工代號輸入 */}
          <NameInput name={playerName} onChange={setPlayerName} />

          {/* 加密頻道選擇 */}
          <EmojiPicker onRoomSelect={setSelectedRoomId} />

          {/* 連線按鈕 */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleEnterRoom}
            className="w-full max-w-xs mt-2 group font-mono font-bold tracking-widest"
          >
            <span className="flex items-center justify-center gap-2 text-black">
              <Shield className="w-4 h-4 text-black" /> [INITIATE_SYNC_LINK]
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        {/* 底部步驟微縮提示 */}
        <div className="mt-6 pt-4 border-t border-[#00ff9d]/20 w-full text-left">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-black/60 p-2 border border-[#00ff9d]/30 flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#00e5ff] mb-0.5">01 // QUERY</span>
              <span className="text-[9px] text-[#00ff9d]/70 leading-tight">依情境測試標尺<br />禁止透露數字</span>
            </div>
            <div className="bg-black/60 p-2 border border-[#00ff9d]/30 flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#00e5ff] mb-0.5">02 // DISPATCH</span>
              <span className="text-[9px] text-[#00ff9d]/70 leading-tight">直覺由小至大<br />落入記憶體槽位</span>
            </div>
            <div className="bg-black/60 p-2 border border-[#00ff9d]/30 flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#00e5ff] mb-0.5">03 // DECRYPT</span>
              <span className="text-[9px] text-[#00ff9d]/70 leading-tight">全員鎖定揭牌<br />100% 同相過關</span>
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
