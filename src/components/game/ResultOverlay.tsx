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
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#f59e0b", "#38bdf8", "#10b981", "#ffffff"],
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

  let stampLabel = "共鳴";
  let resultTitle = "心天秤完美平衡！";
  let detailRoast = "所有卡牌由小到大精準歸位，彼此的默契宛如一體。";

  if (isWin) {
    if (closestPair && closestPair.diff <= 3) {
      stampLabel = "神合";
      resultTitle = "極限心靈神合！";
      detailRoast = `神仙級默契！${closestPair.a.playerName} 的【${closestPair.a.cardValue}】與 ${closestPair.b.playerName} 的【${closestPair.b.cardValue}】僅差 ${closestPair.diff} 點，依然完美咬合！`;
    } else {
      stampLabel = "共鳴";
      resultTitle = "心天秤圓滿平衡！";
      detailRoast = `全員在主題《${topic?.title || "經典心流"}》下的價值觀驚人一致，成功全數過關！`;
    }
  } else {
    stampLabel = "失衡";
    resultTitle = "價值觀出現交錯失衡";
    if (firstError) {
      detailRoast = `在【第 ${firstError.slotIdx} 席】發生順序交錯！${firstError.cardA.playerName} 的【${firstError.cardA.cardValue}】落在 ${firstError.cardB.playerName} 的【${firstError.cardB.cardValue}】前面。`;
    } else {
      detailRoast = "某張卡牌順序微幅交錯，彼此的心跳節奏稍有誤差，再試一局！";
    }
  }

  const handleCopyReport = async () => {
    try {
      const shareText = `🎴 心天秤 (Mind Sync) ‧ 默契檢定報告\n📌 本局主題：《${topic?.title || "純數字心流"}》\n⚖️ 判定：【${stampLabel}】 心靈同步率 ${syncRate}%\n💬 結語：${detailRoast}\n\n🌐 來測你們的價值觀默契：https://louis-369.github.io/mind-sync/`;
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
            <RotateCcw className="w-4 h-4 text-black mr-1" /> 房主重新開局
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
            <span>靜候房主重新開局...</span>
          </div>
        )}
      </div>
    );
  }

  if (!mounted) return null;

  const modalJSX = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="bg-[#12161f] border border-slate-700 rounded-2xl p-6 text-center shadow-2xl relative w-full max-w-md my-auto flex flex-col items-center">
        {/* 圖示徽章 */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mb-3 shadow-lg border-2 ${
          isWin
            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            : "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        }`}>
          {isWin ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>

        <h2 className={`text-xl font-bold mb-1 tracking-wide ${isWin ? "text-emerald-400" : "text-red-400"}`}>
          {resultTitle}
        </h2>

        {/* 心靈同步率膠囊 */}
        <div className="flex items-center gap-2 my-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
          <span className="text-xs text-slate-400">心靈同步率</span>
          <span className="text-base font-bold text-[#f59e0b] font-mono">{syncRate}%</span>
        </div>

        {/* 評語調侃 */}
        <p className="text-xs sm:text-sm text-slate-200 my-3 max-w-xs leading-relaxed bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-left">
          {detailRoast}
        </p>

        {/* 操作按鈕組 */}
        <div className="flex flex-col items-center justify-center gap-2 w-full max-w-xs mx-auto mt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopyReport}
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            {copiedReport ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>已複製戰報，快去分享發串！</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-300" />
                <span>複製對局戰報 (分享好友/Threads)</span>
              </>
            )}
          </Button>

          {isHost ? (
            <Button
              variant={isWin ? "primary" : "danger"}
              size="md"
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4" /> 房主重新開局
            </Button>
          ) : (
            <div className="text-xs text-slate-400 py-2.5 text-center bg-slate-800/60 w-full rounded-lg border border-slate-700">
              靜候房主重新開局...
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(false)}
            className="w-full text-xs text-slate-400 hover:text-white"
          >
            <Eye className="w-3.5 h-3.5" /> 檢視盤面席位
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
