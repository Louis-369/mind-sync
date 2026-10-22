"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { RotateCcw, Eye, Share2, Check } from "lucide-react";
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
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#c9a96e", "#e8dcc8", "#2d5a7b", "#f5f0e3"],
            });
          } catch (error) {
            console.error("觸發彩帶動畫失敗:", error);
          }
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

  // 排序並分析盤面卡牌
  const sortedBoard = [...board].sort((a, b) => {
    const slotA = parseInt((a.slotId || a.uniqueKey || "").replace("slot-", ""), 10) || 0;
    const slotB = parseInt((b.slotId || b.uniqueKey || "").replace("slot-", ""), 10) || 0;
    return slotA - slotB;
  });

  // 計算相鄰正確對數與同步率
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

// 決定評語與專屬稱號印章
  let stampLabel = "共鳴";
  let resultTitle = "心天秤完美平衡！";
  let detailRoast = "所有和紙卡牌由小到大精準歸位，彼此的默契宛如一體。";

  if (isWin) {
    if (closestPair && closestPair.diff <= 3) {
      stampLabel = "神合";
      resultTitle = "極限心靈神合！";
      detailRoast = `神仙級默契！${closestPair.a.playerName} 的【${closestPair.a.cardValue}】與 ${closestPair.b.playerName} 的【${closestPair.b.cardValue}】僅差 ${closestPair.diff} 點，依然完美咬合！`;
    } else {
      stampLabel = "共鳴";
      resultTitle = "心天秤圓滿平衡！";
      detailRoast = `全員在主題《${topic?.title || "心流"}》下的價值觀驚人一致，成功全數過關！`;
    }
  } else {
    stampLabel = "失衡";
    resultTitle = "價值觀出現交錯失衡";
    if (firstError) {
      const KANJI = ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾"];
      const slotKanji = KANJI[firstError.slotIdx - 1] || `${firstError.slotIdx}`;
      detailRoast = `在【${slotKanji}之席】發生價值斷層！${firstError.cardA.playerName} 的【${firstError.cardA.cardValue}】搶先落在了 ${firstError.cardB.playerName} 的【${firstError.cardB.cardValue}】前面。`;
    } else {
      detailRoast = "某張卡牌順序微幅交錯，彼此的心跳節奏稍有誤差，再試一局！";
    }
  }

  // 偷師 ascii-magic 的 ASCII 證書戰報單生成
  const asciiProgressBar = (() => {
    const totalBars = 10;
    const filled = Math.min(totalBars, Math.max(0, Math.round((syncRate / 100) * totalBars)));
    return "█".repeat(filled) + "░".repeat(totalBars - filled);
  })();

  const balanceSymbol = isWin ? "━━━━━━━●━━━━━━━" : "━━━━━▲━━●━━━━━━";

  const cardChainText = sortedBoard
    .map((c, idx) => {
      const valStr = String(c.cardValue).padStart(2, "0");
      const prev = sortedBoard[idx - 1];
      const isErr = prev && prev.cardValue > c.cardValue;
      return isErr ? `[!${valStr}!]:${c.playerName}` : `[${valStr}]:${c.playerName}`;
    })
    .join(" ─► ");

  const asciiReportText = [
    "┌─── 🎴 心天秤 ‧ 默契檢定戰報 ───┐",
    ` 主題：《${topic?.title || "純數字心流"}》`,
    ` 判定：【${stampLabel}】 ${balanceSymbol}`,
    ` 同步：[${asciiProgressBar}] ${syncRate}%`,
    " 牌席鏈：",
    ` ${cardChainText || "無卡牌"}`,
    " 結語：",
    ` ${detailRoast}`,
    "└──────────────────────────────┘",
    "來測你們的心靈天秤：https://louis-369.github.io/mind-sync/",
  ].join("\n");

  // 產生 Threads / 社群複製戰報
  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(asciiReportText);
      sound.playSlotTap();
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch (e) {
      console.error("複製戰報失敗:", e);
    }
  };

  // 當使用者點擊「檢視盤面」後關閉彈窗
  if (!showModal) {
    return (
      <div className="game-action-bar animate-fade-in relative z-20">
        {isHost ? (
          <Button variant="primary" size="md" onClick={onRestart} className="host-action-btn">
            <RotateCcw className="w-4 h-4 text-ukiyo-gold" /> 房主重新開局
          </Button>
        ) : (
          <div className="guest-wait-badge">
            <span className="w-2 h-2 rounded-full bg-ukiyo-gold animate-ping" />
            <span>靜候房主重新開局...</span>
          </div>
        )}
      </div>
    );
  }

  if (!mounted) return null;

  // 結算 Modal
  const modalJSX = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ukiyo-bg/90 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="glass-panel rounded-3xl p-6 text-center border border-ukiyo-foam/20 shadow-2xl relative overflow-hidden flex flex-col items-center w-full max-w-md my-auto">
        <div className="flex flex-col items-center w-full pt-1">
          {/* 大字書法落款印章 */}
          <div
            className={`w-18 h-18 rounded-2xl flex items-center justify-center text-3xl font-serif font-black mb-3 shadow-2xl border ${
              stampLabel === "神合"
                ? "bg-gradient-to-br from-ukiyo-cream via-ukiyo-gold to-[#a18247] text-ukiyo-bg border-ukiyo-gold shadow-[0_0_30px_rgba(201,169,110,0.8)] animate-pulse"
                : isWin
                ? "bg-ukiyo-gold text-ukiyo-bg border-ukiyo-gold/60 shadow-[0_0_20px_rgba(201,169,110,0.5)]"
                : "ukiyo-seal text-ukiyo-cream border-ukiyo-vermillion/60 shadow-[0_0_20px_rgba(199,62,29,0.6)]"
            }`}
          >
            {stampLabel}
          </div>

          <h2 className={`text-xl sm:text-2xl font-serif font-black mb-1 tracking-widest ${isWin ? "text-ukiyo-gold" : "text-ukiyo-vermillion"}`}>
            {resultTitle}
          </h2>

          {/* 心靈同步率膠囊 */}
          <div className="flex items-center gap-2 my-2 bg-ukiyo-bg/80 px-4 py-1.5 rounded-full border border-ukiyo-foam/15">
            <span className="text-xs font-serif text-ukiyo-mist">心靈同步率</span>
            <span className="text-base sm:text-lg font-mono font-black text-ukiyo-gold">
              {syncRate}%
            </span>
          </div>

          {/* 戰犯抓包 / 神默契調侃評語 */}
          <p className="text-xs sm:text-sm text-ukiyo-foam/90 my-2 max-w-xs leading-relaxed font-serif bg-ukiyo-surface/60 p-3 rounded-2xl border border-ukiyo-foam/10">
            {detailRoast}
          </p>

          {/* ASCII 證書戰報預覽框 (偷師 ascii-magic) */}
          <div className="w-full max-w-xs my-1 text-left">
            <div className="flex items-center justify-between text-[10px] text-ukiyo-mist/70 font-mono px-1 pb-1">
              <span>ASCII 默契戰報預覽</span>
              <span>[純文字可複製]</span>
            </div>
            <pre className="w-full text-left font-mono text-[9.5px] sm:text-[10.5px] leading-tight text-ukiyo-gold/90 bg-black/60 p-2.5 rounded-xl border border-ukiyo-gold/20 overflow-x-auto whitespace-pre select-all shadow-inner scrollbar-thin">
              {asciiReportText}
            </pre>
          </div>

          {/* 操作按鈕組 */}
          <div className="flex flex-col items-center justify-center gap-2 w-full max-w-xs mx-auto mt-2">
            {/* 一鍵複製戰報 */}
            <Button
              variant="secondary"
              size="md"
              onClick={handleCopyReport}
              className="w-full flex items-center justify-center gap-2 font-serif text-xs text-ukiyo-gold border-ukiyo-gold/40 hover:bg-ukiyo-gold/15 cursor-pointer rounded-xl"
            >
              {copiedReport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>已複製戰報，快去分享發串！</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-ukiyo-gold" />
                  <span>複製對局戰報 (分享好友/Threads)</span>
                </>
              )}
            </Button>

            {isHost ? (
              <Button
                variant={isWin ? "primary" : "danger"}
                size="md"
                onClick={onRestart}
                className="w-full flex items-center justify-center gap-2 font-serif tracking-widest cursor-pointer rounded-xl"
              >
                <RotateCcw className="w-4 h-4" /> 房主重新開局
              </Button>
            ) : (
              <div className="text-xs text-ukiyo-mist font-serif py-2.5 text-center bg-ukiyo-surface/60 w-full rounded-xl border border-ukiyo-foam/10">
                靜候房主重新開局...
              </div>
            )}

            {/* 檢視盤面按鈕 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModal(false)}
              className="w-full text-xs text-ukiyo-mist hover:text-ukiyo-foam font-serif cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> 檢視盤面席位
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
