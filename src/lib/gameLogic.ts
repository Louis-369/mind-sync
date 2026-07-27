import { BoardCard } from "../types/game";

// 生成洗牌後的 1-100 卡牌陣列
export function generateShuffledDeck(): number[] {
  const deck = Array.from({ length: 100 }, (_, i) => i + 1);
  // Fisher-Yates 洗牌演算法
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// 檢測盤面上是否有碰撞衝突 (例如同一位置被不同人放置，或放置順序問題)
export function detectCollisions(boardCards: BoardCard[]): {
  hasCollision: boolean;
  collidedSlots: string[];
  message?: string;
} {
  // 按放置時間排序
  const sortedByTime = [...boardCards].sort((a, b) => a.placedAt - b.placedAt);
  const collidedSlots: string[] = [];

  // 如果較後出牌的數值比前面出牌的數值小，即產生碰撞錯誤 (不符合遞增)
  for (let i = 1; i < sortedByTime.length; i++) {
    if (sortedByTime[i].cardValue < sortedByTime[i - 1].cardValue) {
      collidedSlots.push(`${sortedByTime[i].cardValue}`);
    }
  }

  return {
    hasCollision: collidedSlots.length > 0,
    collidedSlots,
    message: collidedSlots.length > 0 ? "發現卡牌數值倒置衝突！" : undefined,
  };
}

// 驗證盤面所有翻開的卡片是否為嚴格遞增順序
export function checkAscendingOrder(cards: BoardCard[]): boolean {
  if (cards.length <= 1) return true;
  
  // 按盤面位置或翻開順序比對
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].cardValue >= cards[i + 1].cardValue) {
      return false;
    }
  }
  return true;
}

// 格式化 Emoji 房間 ID (例如: "🐶-🚀-🍎")
export function buildRoomId(emoji1: string, emoji2: string, emoji3: string): string {
  return `${emoji1}-${emoji2}-${emoji3}`;
}
