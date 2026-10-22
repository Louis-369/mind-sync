"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { RotateCcw, Eye, Share2, Check, AlertOctagon, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { BoardCard, TopicItem } from "../../types/game";
import { sound } from "../../lib/soundEngine";

interface ResultOverlayProps {
  result: "win" | "lose" | null;
  isHost: boolean;
  onRestart: () => void;
  board?: BoardCard[];
  topic?: TopicItem;
}

export function ResultOverlay({
  result,
  isHost,
  onRestart,
  board = [],
  topic,
}: ResultOverlayProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeResultRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (result) {
      if (activeResultRef.current === result) return;
      activeResultRef.current = result;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setShowModal(true);

        if (result === "win") {
          try {
            sound.playVictory();
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ["#00ff9d", "#00e5ff", "#ffffff"],
            });
          } catch (error) {
            console.error("觸發彩帶動畫失敗:", error);
          }
        } else {
          sound.playCollisionWarn();
        }
      }, 700);
    } else {
      activeResultRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowModal(false);
    }

    return () => {};
  }, [result]);

  if (!result) return null;

  const isWin = result === "win";

  const sortedBoard = [...board].sort((a, b) => {
    const slotA = parseInt((a.slotId || a.uniqueKey || "").replace("slot-", ""), 10) || 0;
    const slotB = parseInt((b.slotId || b.uniqueKey || "").replace("slot-", ""), 10) || 0;
    return slotA - slotB;
  });

  let correctPairs = 0;
  const totalPairs = Math.max(1, sortedBoard.length - 1);
  let minDiff = 100;
  let closestPair: { a: BoardCard; b: BoardCard; diff: number } | null = null;
  let firstError: { slotIdx: number; cardA: BoardCard; cardB: BoardCard } | null = null;

  for (let i = 0; i < sortedBoard.length - 1; i++) {
    const a = sortedBoard[i];
    const b = sortedBoard[i + 1];
    if (a.cardValue <= b.cardValue) {
      correctPairs++;
      const diff = b.cardValue - a.cardValue;
      if (diff < minDiff) {
        minDiff = diff;
        closestPair = { a, b, diff };
      }
    } else if (!firstError) {
      firstError = { slotIdx: i + 1, cardA: a, cardB: b };
    }
  }

  const syncRate = Math.round((correctPairs / totalPairs) * 100);

  let statusBadge = "PERFECT_HARMONY";
  let resultTitle = "SYS://SYNC_SUCCESS [100%]";
  let detailDiagnostic = "所有資料封包由低頻至高頻完美排序，神經頻率達成完全同相！";

  if (isWin) {
    if (closestPair && closestPair.diff <= 3) {
      statusBadge = "QUANTUM_SYNC";
      resultTitle = "SYS://EXTREME_RESONANCE";
      detailDiagnostic = `極限神經契合！特工 ${closestPair.a.playerName} [${closestPair.a.cardValue}] 與 ${closestPair.b.playerName} [${closestPair.b.cardValue}] 僅差 ${closestPair.diff} 單位，零碰撞咬合！`;
    } else {
      statusBadge = "SYNC_PASSED";
      resultTitle = "SYS://SYNCHRONIZATION_OK";
      detailDiagnostic = `全體特工在測試協定《${topic?.title || "CLASSIC"}》下達成高度共識，封包無失真通過！`;
    }
  } else {
    statusBadge = "FATAL_DESYNC";
    resultTitle = "SYS://DESYNCHRONIZATION_ERR";
    if (firstError) {
      detailDiagnostic = `在 [NODE_0x${firstError.slotIdx.toString(16).toUpperCase()}] 檢測到頻率逆向斷層！特工 ${firstError.cardA.playerName} [${firstError.cardA.cardValue}] 搶先佔位在 ${firstError.cardB.playerName} [${firstError.cardB.cardValue}] 之前。`;
    } else {
      detailDiagnostic = "檢測到封包順序輕微錯置，系統頻率失諧，建議重啟同步測試！";
    }
  }

  const handleCopyReport = async () => {
    try {
      const shareText = `[SYS://MIND_SYNC_DIAGNOSTIC]\nQUERY: 《${topic?.title || "SYS://BENCHMARK_ALPHA"}》\nSTATUS: [${statusBadge}] SYNC_RATE: ${syncRate}%\nLOG: ${detailDiagnostic}\nLINK: https://louis-369.github.io/mind-sync/`;
      await navigator.clipboard.writeText(shareText);
      sound.playSlotTap();
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch (e) {
      console.error("複製診斷日誌失敗:", e);
    }
  };

  if (!showModal) {
    return (
      <div className="game-action-bar animate-fade-in relative z-20 font-mono">
        {isHost ? (
          <Button variant="primary" size="md" onClick={onRestart} className="font-mono font-bold">
            <RotateCcw className="w-4 h-4 text-black" /> [ROOT: RESTART_SYNC]
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-black/80 px-3 py-1.5 border border-[#00ff9d]/40 text-xs text-[#00ff9d]">
            <span className="w-2 h-2 bg-[#00ff9d] animate-ping" />
            <span>WAITING_FOR_ROOT_RESTART...</span>
          </div>
        )}
      </div>
    );
  }

  if (!mounted) return null;

  const modalJSX = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in pointer-events-auto font-mono">
      <div className="bg-[#030609] border-2 border-[#00ff9d] p-6 text-center shadow-[0_0_30px_rgba(0,255,157,0.3)] relative w-full max-w-md my-auto flex flex-col items-center">
        {/* 四角錨點 */}
        <div className="absolute top-1 left-1 text-[8px] text-[#00ff9d]">+</div>
        <div className="absolute top-1 right-1 text-[8px] text-[#00ff9d]">+</div>
        <div className="absolute bottom-1 left-1 text-[8px] text-[#00ff9d]">+</div>
        <div className="absolute bottom-1 right-1 text-[8px] text-[#00ff9d]">+</div>

        {/* 頂部標誌 */}
        <div className={`w-14 h-14 flex items-center justify-center text-xl font-bold mb-3 border-2 ${
          isWin
            ? "bg-[#00ff9d]/20 border-[#00ff9d] text-[#00ff9d] shadow-[0_0_20px_#00ff9d]"
            : "bg-[#ff0055]/20 border-[#ff0055] text-[#ff0055] shadow-[0_0_20px_#ff0055]"
        }`}>
          {isWin ? <CheckCircle2 className="w-8 h-8" /> : <AlertOctagon className="w-8 h-8" />}
        </div>

        <h2 className={`text-lg sm:text-xl font-black mb-1 tracking-wider ${isWin ? "text-[#00ff9d]" : "text-[#ff0055]"}`}>
          {resultTitle}
        </h2>

        {/* 同步率進度列 */}
        <div className="flex items-center gap-2 my-2 bg-black/80 px-4 py-1 border border-[#00ff9d]/40 text-xs">
          <span className="text-[#00e5ff]">SYNC_RATE:</span>
          <span className="text-base font-bold text-[#00ff9d]">{syncRate}%</span>
        </div>

        {/* 診斷日誌文字 */}
        <p className="text-xs text-[#00ff9d]/90 my-3 max-w-xs leading-relaxed bg-[#04080e] p-3 border border-[#00ff9d]/30 text-left">
          &gt; {detailDiagnostic}
        </p>

        {/* 操作按鈕群 */}
        <div className="flex flex-col items-center justify-center gap-2 w-full max-w-xs mx-auto mt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopyReport}
            className="w-full flex items-center justify-center gap-2 text-xs font-mono font-bold border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff]/20"
          >
            {copiedReport ? (
              <>
                <Check className="w-4 h-4 text-[#00ff9d]" />
                <span>[LOG_COPIED_TO_BUFFER]</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#00e5ff]" />
                <span>[COPY_DIAGNOSTIC_LOG]</span>
              </>
            )}
          </Button>

          {isHost ? (
            <Button
              variant={isWin ? "primary" : "danger"}
              size="md"
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 font-mono font-bold"
            >
              <RotateCcw className="w-4 h-4" /> [ROOT: REBOOT_SEQUENCE]
            </Button>
          ) : (
            <div className="text-xs text-[#00ff9d]/50 py-2 text-center bg-black/60 w-full border border-[#00ff9d]/20">
              [WAITING_FOR_ROOT_RESTART...]
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(false)}
            className="w-full text-xs text-[#00ff9d]/60 hover:text-[#00ff9d] font-mono"
          >
            <Eye className="w-3.5 h-3.5" /> [INSPECT_NODES]
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
