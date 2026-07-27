"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";

interface ResultOverlayProps {
  result: "win" | "lose" | null;
  onRestart: () => void;
}

export function ResultOverlay({ result, onRestart }: ResultOverlayProps) {
  useEffect(() => {
    if (result === "win") {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#c9a96e", "#e8dcc8", "#3d5a80"],
        });
      } catch (error) {
        console.error("觸發彩帶動畫失敗:", error);
      }
    }
    return () => {};
  }, [result]);

  if (!result) return null;

  const isWin = result === "win";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ukiyo-bg/90 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 text-center border border-ukiyo-foam/20 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* 日式朱紅/金箔大印章 */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif font-bold mb-4 shadow-xl ${
            isWin ? "bg-ukiyo-gold text-ukiyo-bg" : "ukiyo-seal text-ukiyo-cream animate-wave-float"
          }`}
        >
          {isWin ? "勝" : "敗"}
        </div>

        <h2 className={`text-2xl md:text-3xl font-serif font-black mb-2 tracking-widest ${isWin ? "text-ukiyo-gold" : "text-ukiyo-vermillion"}`}>
          {isWin ? "心靈極限極致同步" : "心靈感應中斷"}
        </h2>

        <p className="text-xs md:text-sm text-ukiyo-mist mb-6 max-w-xs leading-relaxed font-serif">
          {isWin
            ? "無需隻字片語，默契如潮水般流暢，牌陣順序完美達成！"
            : "卡牌數值發生倒置衝突，心靈修練尚未結束，重組心境再試一次。"}
        </p>

        <Button
          variant={isWin ? "primary" : "danger"}
          size="lg"
          onClick={onRestart}
          className="flex items-center gap-2 font-serif tracking-widest"
        >
          <RotateCcw className="w-4 h-4" /> 重新開局
        </Button>
      </div>
    </div>
  );
}
