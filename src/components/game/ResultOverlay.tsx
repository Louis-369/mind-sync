"use client";

import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { RotateCcw, Eye } from "lucide-react";
import { Button } from "../ui/Button";

interface ResultOverlayProps {
  result: "win" | "lose" | null;
  isHost: boolean;
  onRestart: () => void;
}

export function ResultOverlay({ result, isHost, onRestart }: ResultOverlayProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeResultRef = useRef<string | null>(null);

  useEffect(() => {
    if (result) {
      // 避免 Presence 重繪重置
      if (activeResultRef.current === result) return;
      activeResultRef.current = result;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setShowModal(true);

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
      }, 800);
    } else {
      activeResultRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowModal(false);
    }

    return () => {};
  }, [result]);

  if (!result) return null;

  const isWin = result === "win";

  // 當使用者點擊「檢視盤面」後 (showModal === false)，彈窗關閉且不保留「跳回彈窗」按鈕，僅於底部常規佈局流顯示重開/靜候按鈕
  if (!showModal) {
    return (
      <div className="w-full my-3 flex items-center justify-center text-center animate-fade-in">
        {isHost ? (
          <Button
            variant="primary"
            size="md"
            onClick={onRestart}
            className="text-xs md:text-sm font-serif font-bold flex items-center justify-center gap-2 py-3 px-8 shadow-2xl tracking-widest text-center"
          >
            <RotateCcw className="w-4 h-4 text-ukiyo-gold" /> 房主重新開局
          </Button>
        ) : (
          <div className="bg-ukiyo-surface/95 text-ukiyo-mist border border-ukiyo-foam/20 shadow-xl px-6 py-3 rounded-2xl text-xs font-serif flex items-center justify-center gap-2 text-center">
            <span className="w-2 h-2 rounded-full bg-ukiyo-gold animate-ping" />
            <span>靜候房主重新開局...</span>
          </div>
        )}
      </div>
    );
  }

  // 遊戲剛結束時自動跳出的勝負結算彈窗 Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ukiyo-bg/85 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="glass-panel rounded-3xl p-6 text-center border border-ukiyo-foam/20 shadow-2xl relative overflow-hidden flex flex-col items-center w-full max-w-md my-auto">
        <div className="flex flex-col items-center w-full pt-2">
          {/* 勝負印章 */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-serif font-bold mb-3 shadow-lg ${
              isWin ? "bg-ukiyo-gold text-ukiyo-bg" : "ukiyo-seal text-ukiyo-cream"
            }`}
          >
            {isWin ? "勝" : "敗"}
          </div>

          <h2 className={`text-2xl font-serif font-black mb-2 tracking-widest ${isWin ? "text-ukiyo-gold" : "text-ukiyo-vermillion"}`}>
            {isWin ? "默契完美對齊！" : "價值觀出現交錯"}
          </h2>

          <p className="text-xs text-ukiyo-mist mb-5 max-w-xs leading-relaxed font-serif">
            {isWin
              ? "大家對主題的價值觀理解一致，卡牌順序完美排列！"
              : "牌陣順序有些微交錯，交流一下彼此的想法，再試一次！"}
          </p>

          {/* 操作按鈕組 */}
          <div className="flex flex-col items-center justify-center gap-2.5 w-full max-w-xs mx-auto">
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

            {/* 檢視盤面按鈕 (點擊後關閉彈窗，絕不保留跳回彈窗的重複按鈕) */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowModal(false)}
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
