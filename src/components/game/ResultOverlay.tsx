"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { RotateCcw, Eye, Share2, Check, CheckCircle2, AlertTriangle } from "lucide-react";
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
              particleCount: 100,
              spread: 75,
              origin: { y: 0.6 },
              colors: ["#f59e0b", "#0ea5e9", "#10b981", "#ef4444"],
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

  let stampLabel = "過關";
  let resultTitle = "挑戰成功！順序完全正確！";
  let detailRoast = "所有數字牌都由小到大完美排好，你們的默契太強了！";

  if (isWin) {
    if (closestPair && closestPair.diff <= 3) {
      stampLabel = "神默契";
      resultTitle = "神級默契！挑戰大成功！";
      detailRoast = `太扯了！${closestPair.a.playerName} 的【${closestPair.a.cardValue}】跟 ${closestPair.b.playerName} 的【${closestPair.b.cardValue}】只差 ${closestPair.diff} 點，居然還排對順序！`;
    } else {
      stampLabel = "過關";
      resultTitle = "挑戰成功！順序完全正確！";
      detailRoast = `大家在題目《${topic?.title || "數字排序"}》的想法超一致，順利過關！`;
    }
  } else {
    stampLabel = "失敗";
    resultTitle = "挑戰失敗！有牌順序排錯了";
    if (firstError) {
      detailRoast = `在【第 ${firstError.slotIdx} 格】排錯了！${firstError.cardA.playerName} 的【${firstError.cardA.cardValue}】比後面 ${firstError.cardB.playerName} 的【${firstError.cardB.cardValue}】還要大。`;
    } else {
      detailRoast = "有幾張牌的大小順序顛倒了，再試一局一定能過！";
    }
  }

  const handleCopyReport = async () => {
    try {
      const shareText = `🎴 心天秤 (Mind Sync) ‧ 戰報\n📌 本局題目：《${topic?.title || "數字排序"}》\n⚖️ 結果：【${stampLabel}】 默契同步率 ${syncRate}%\n💬 戰況：${detailRoast}\n\n🌐 來測你們的默契：https://louis-369.github.io/mind-sync/`;
      await navigator.clipboard.writeText(shareText);
      sound.playSlotTap();
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch (e) {
      console.error("複製戰報失敗:", e);
    }
  };

  if (!showModal) {
    return (
      <div className="game-action-bar animate-fade-in relative z-20">
        {isHost ? (
          <Button variant="primary" size="md" onClick={onRestart}>
            <RotateCcw className="w-4 h-4 text-[#18181b] mr-1" /> 再來一局
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-[#ffffff] px-4 py-2 rounded-xl border-2 border-[#18181b] text-xs font-black text-[#18181b] shadow-[2px_2px_0px_#18181b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] border border-[#18181b] animate-ping" />
            <span>等待房主開始下一局...</span>
          </div>
        )}
      </div>
    );
  }

  if (!mounted) return null;

  const modalJSX = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className="bg-[#ffffff] border-2 border-[#18181b] rounded-3xl p-6 sm:p-8 text-center shadow-[8px_8px_0px_#18181b] relative w-full max-w-md my-auto flex flex-col items-center">
        {/* 圖示徽章 */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black mb-3 shadow-[3px_3px_0px_#18181b] border-2 border-[#18181b] ${
            isWin ? "bg-[#d1fae5] text-[#059669]" : "bg-[#fee2e2] text-[#dc2626]"
          }`}
        >
          {isWin ? <CheckCircle2 className="w-9 h-9" /> : <AlertTriangle className="w-9 h-9" />}
        </div>

        <h2 className={`text-xl sm:text-2xl font-black mb-1 tracking-wide ${isWin ? "text-[#059669]" : "text-[#dc2626]"}`}>
          {resultTitle}
        </h2>

        {/* 默契同步率膠囊 */}
        <div className="flex items-center gap-2 my-2 bg-[#f4f1ea] px-4 py-1.5 rounded-full border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b]">
          <span className="text-xs font-bold text-slate-600">默契同步率</span>
          <span className="text-lg font-black text-[#f59e0b] font-mono">{syncRate}%</span>
        </div>

        {/* 評語 */}
        <p className="text-xs sm:text-sm text-slate-700 font-bold my-3 max-w-xs leading-relaxed bg-[#f4f1ea] p-3.5 rounded-2xl border-2 border-[#18181b] text-left shadow-[2px_2px_0px_#18181b]">
          {detailRoast}
        </p>

        {/* 操作按鈕組 */}
        <div className="flex flex-col items-center justify-center gap-2.5 w-full max-w-xs mx-auto mt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopyReport}
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            {copiedReport ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>已複製戰報！快貼給朋友看</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>複製本局戰報分享</span>
              </>
            )}
          </Button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full mt-1">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowModal(false)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              <Eye className="w-4 h-4" />
              <span>看桌面卡牌</span>
            </Button>

            {isHost ? (
              <Button variant="primary" size="md" onClick={onRestart} className="w-full sm:w-auto text-xs font-black">
                <RotateCcw className="w-3.5 h-3.5 text-[#18181b] mr-1" /> 再來一局
              </Button>
            ) : (
              <div className="text-xs text-slate-500 font-bold py-1 px-2">
                等待房主開新局...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
