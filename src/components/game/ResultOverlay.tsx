"use client";

import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { RotateCcw, Eye, Trophy } from "lucide-react";
import { Button } from "../ui/Button";

interface ResultOverlayProps {
  result: "win" | "lose" | null;
  isHost: boolean;
  onRestart: () => void;
}

export function ResultOverlay({ result, isHost, onRestart }: ResultOverlayProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeResultRef = useRef<string | null>(null);

  useEffect(() => {
    if (result) {
      // 若該勝負結果已經啟動過計時器，避免 LiveblocksPresence 心跳重繪引起 clearTimeout 重置
      if (activeResultRef.current === result) return;
      activeResultRef.current = result;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setShowModal(true);
        setIsCollapsed(false);

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
      }, 1500);
    } else {
      activeResultRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowModal(false);
    }

    return () => {};
  }, [result]);

  if (!result || !showModal) return null;

  const isWin = result === "win";

  if (isCollapsed) {
    return (
      <div className="fixed bottom-5 right-5 z-50 animate-fade-in pointer-events-auto">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center space-x-1.5 bg-ukiyo-surface/95 text-ukiyo-gold border border-ukiyo-gold/40 shadow-ukiyo-glow px-3 py-2 rounded-xl text-xs font-serif font-bold hover:bg-ukiyo-surface transition-all active:scale-95"
        >
          <Trophy className="w-4 h-4 text-ukiyo-gold" />
          <span>顯示結算結果 ({isWin ? "勝" : "敗"})</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ukiyo-bg/85 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="glass-panel rounded-3xl p-6 text-center border border-ukiyo-foam/20 shadow-2xl relative overflow-hidden flex flex-col items-center w-full max-w-md my-auto">
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
            {isWin ? "天秤完美平衡" : "天秤傾斜失衡"}
          </h2>

          <p className="text-xs text-ukiyo-mist mb-5 max-w-xs leading-relaxed font-serif">
            {isWin
              ? "默契如潮水般流暢，全員牌陣順序完美達成！"
              : "天秤傾斜，牌序失衡。重新調頻再試一次。"}
          </p>

          {/* 操作按鈕組：重新開局與顯眼的查看盤面 */}
          <div className="flex flex-col gap-2.5 w-full max-w-xs">
            {isHost ? (
              <Button
                variant={isWin ? "primary" : "danger"}
                size="md"
                onClick={onRestart}
                className="w-full flex items-center justify-center gap-2 font-serif tracking-widest"
              >
                <RotateCcw className="w-4 h-4" /> 房主重新開局
              </Button>
            ) : (
              <div className="text-xs text-ukiyo-mist font-serif py-2.5 text-center bg-ukiyo-surface/60 w-full rounded-xl border border-ukiyo-foam/10">
                靜候房主重新開局...
              </div>
            )}

            {/* 大顆顯眼的次要操作按鈕：檢視盤面 */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsCollapsed(true)}
              className="w-full flex items-center justify-center gap-2 font-serif tracking-widest text-ukiyo-gold border-ukiyo-gold/40 hover:bg-ukiyo-gold/10"
            >
              <Eye className="w-4 h-4 text-ukiyo-gold" /> 檢視盤面
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
