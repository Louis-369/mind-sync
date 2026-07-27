"use client";

import React from "react";
import { BoardSlot } from "./BoardSlot";
import { BoardCard } from "../../types/game";

interface GameBoardProps {
  board: (BoardCard & { slotId: string })[];
  currentConnectionId: string;
  status: string;
  onRecallCard?: (slotId: string) => void;
  onFlipCard?: (slotId: string) => void;
}

export function GameBoard({
  board,
  currentConnectionId,
  status,
  onRecallCard,
  onFlipCard,
}: GameBoardProps) {
  // 按放置時間排序展示
  const sortedBoard = [...board].sort((a, b) => a.placedAt - b.placedAt);

  return (
    <div className="w-full min-h-[280px] md:min-h-[340px] bg-gradient-to-b from-poker-table via-emerald-950 to-poker-table rounded-3xl p-6 border-4 border-poker-tableBorder shadow-table relative flex flex-col items-center justify-center overflow-hidden">
      {/* 桌布中央裝飾圖騰 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border-8 border-poker-accent flex items-center justify-center">
          <span className="text-8xl">🧠</span>
        </div>
      </div>

      <div className="relative z-10 text-center mb-4">
        <span className="text-xs uppercase tracking-widest text-poker-accent font-semibold bg-poker-bg/40 px-3 py-1 rounded-full border border-poker-accent/20">
          {status === "playing" ? "心靈專注打牌中..." : status === "locked" ? "鎖定確認中，準備翻牌！" : "中央出牌區域"}
        </span>
      </div>

      {/* 盤面上的卡片清單 */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-2xl">
        {sortedBoard.length === 0 ? (
          <div className="text-center py-8 text-emerald-300/40 font-medium">
            尚無卡牌在盤面上，選擇手牌打出吧！
          </div>
        ) : (
          sortedBoard.map((item) => (
            <BoardSlot
              key={item.slotId}
              slotId={item.slotId}
              card={item}
              isCurrentPlayer={item.playerId === currentConnectionId}
              onRecall={onRecallCard}
              onFlip={onFlipCard}
            />
          ))
        )}
      </div>
    </div>
  );
}
