"use client";

import { BoardCard } from "../types/game";

export interface DerivedBoardState {
  totalSlotsCount: number;
  slotsMap: Record<string, BoardCard[]>;
  slotCorrectnessMap: Record<string, boolean>;
  isFinishedReveal: boolean;
}

export function useBoardState(
  board: BoardCard[],
  totalPlayers: number = 2,
  cardsPerPlayer: number = 2,
  status: string = "waiting"
): DerivedBoardState {
  const totalSlotsCount = Math.min(12, Math.max(2, totalPlayers * cardsPerPlayer));

  const slotsMap: Record<string, BoardCard[]> = {};
  for (let i = 0; i < totalSlotsCount; i++) {
    slotsMap[`slot-${i}`] = [];
  }

  const sortedBoard = [...board].sort((a, b) => a.placedAt - b.placedAt);
  sortedBoard.forEach((item, idx) => {
    const targetKey = item.slotId && slotsMap[item.slotId] ? item.slotId : `slot-${idx % totalSlotsCount}`;
    if (slotsMap[targetKey]) {
      slotsMap[targetKey].push(item);
    } else {
      slotsMap[`slot-${idx % totalSlotsCount}`].push(item);
    }
  });

  const slotCorrectnessMap: Record<string, boolean> = {};
  const flippedSlots: { slotKey: string; slotIdx: number; val: number }[] = [];

  for (let i = 0; i < totalSlotsCount; i++) {
    const key = `slot-${i}`;
    const cards = slotsMap[key] || [];
    const topCard = cards[cards.length - 1];
    if (topCard && topCard.flipped) {
      flippedSlots.push({ slotKey: key, slotIdx: i, val: topCard.cardValue });
    }
  }

  if (flippedSlots.length > 0) {
    const sortedCards = [...flippedSlots].sort((a, b) => a.val - b.val);
    flippedSlots.forEach((slot, idx) => {
      const expectedVal = sortedCards[idx].val;
      slotCorrectnessMap[slot.slotKey] = slot.val === expectedVal;
    });
  }

  const isAllCardsFlipped = board.length > 0 && board.every((c) => c.flipped);
  const isFinishedReveal = status === "finished" || isAllCardsFlipped;

  return {
    totalSlotsCount,
    slotsMap,
    slotCorrectnessMap,
    isFinishedReveal,
  };
}
