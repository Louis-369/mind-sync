"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, AlertTriangle, RotateCcw } from "lucide-react";
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
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center border-2 border-poker-accent shadow-2xl relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${isWin ? "bg-amber-400" : "bg-red-600"}`} />

        <div className="relative z-10 flex flex-col items-center">
          {isWin ? (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 shadow-glow-gold">
              <Trophy className="w-10 h-10 text-amber-300 animate-bounce" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4 animate-shake">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          )}

          <h2 className={`text-3xl font-black mb-2 tracking-wide ${isWin ? "text-poker-neonGold" : "text-red-400"}`}>
            {isWin ? "心靈極限同步成功！" : "心靈同步中斷！"}
          </h2>

          <p className="text-sm text-gray-300 mb-6 max-w-xs">
            {isWin
              ? "太不可思議了！所有人完全沒有語言溝通，依然按照精準的數字順序出牌！"
              : "卡牌數值發生倒置或碰撞，默契鍛鍊尚未成功，再試一次吧！"}
          </p>

          <Button variant={isWin ? "gold" : "red"} size="lg" onClick={onRestart} className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> 再來一局
          </Button>
        </div>
      </div>
    </div>
  );
}
