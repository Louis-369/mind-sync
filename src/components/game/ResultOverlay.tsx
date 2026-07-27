"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { RotateCcw, Eye, ChevronDown } from "lucide-react";
import { Button } from "../ui/Button";

interface ResultOverlayProps {
  result: "win" | "lose" | null;
  isHost: boolean;
  onRestart: () => void;
}

export function ResultOverlay({ result, isHost, onRestart }: ResultOverlayProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
    // 結算產生時預設展開
    if (result) setIsCollapsed(false);
    return () => {};
  }, [result]);

  if (!result) return null;

  const isWin = result === "win";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ukiyo-bg/85 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="glass-panel rounded-3xl p-6 text-center border border-ukiyo-foam/20 shadow-2xl relative overflow-hidden flex flex-col items-center w-full max-w-md my-auto">
        {/* 頂部隱藏/收起按鈕 */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-3 right-3 text-ukiyo-mist hover:text-ukiyo-foam text-xs flex items-center gap-1 bg-ukiyo-surface/80 px-2.5 py-1 rounded-lg border border-ukiyo-foam/10 transition-colors"
        >
          {isCollapsed ? <Eye className="w-3.5 h-3.5 text-ukiyo-gold" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isCollapsed ? "展開結算" : "查看盤面"}</span>
        </button>

        {isCollapsed ? (
          <div className="py-2 flex items-center space-x-3">
            <span className={`text-base font-serif font-bold ${isWin ? "text-ukiyo-gold" : "text-ukiyo-vermillion"}`}>
              {isWin ? "勝：極致同步成功" : "敗：心靈感應中斷"}
            </span>
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-xs text-ukiyo-gold underline font-serif"
            >
              展開詳情
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full pt-2">
            {/* 印章 */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-serif font-bold mb-3 shadow-lg ${
                isWin ? "bg-ukiyo-gold text-ukiyo-bg" : "ukiyo-seal text-ukiyo-cream"
              }`}
            >
              {isWin ? "勝" : "敗"}
            </div>

            <h2 className={`text-2xl font-serif font-black mb-2 tracking-widest ${isWin ? "text-ukiyo-gold" : "text-ukiyo-vermillion"}`}>
              {isWin ? "心靈極限極致同步" : "心靈感應中斷"}
            </h2>

            <p className="text-xs text-ukiyo-mist mb-5 max-w-xs leading-relaxed font-serif">
              {isWin
                ? "默契如潮水般流暢，全員牌陣順序完美達成！"
                : "卡牌數值順序發生碰撞，重組心境再試一次。"}
            </p>

            {/* 操作按鈕 (僅房主可點擊重新開局) */}
            {isHost ? (
              <Button
                variant={isWin ? "primary" : "danger"}
                size="md"
                onClick={onRestart}
                className="w-full max-w-xs flex items-center justify-center gap-2 font-serif tracking-widest"
              >
                <RotateCcw className="w-4 h-4" /> 房主重新開局
              </Button>
            ) : (
              <div className="text-xs text-ukiyo-mist font-serif py-2 bg-ukiyo-surface/60 w-full rounded-xl border border-ukiyo-foam/10">
                靜候房主重新開局...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
