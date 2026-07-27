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

// 格式化 Emoji 房間 ID (例如: "🐶-🚀-🍎")
export function buildRoomId(emoji1: string, emoji2: string, emoji3: string): string {
  return `${emoji1}-${emoji2}-${emoji3}`;
}
