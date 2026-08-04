// 種子偽隨機數產生器 (Mulberry32)
function seededRandom(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    let t = (h += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 根據種子生成全場一致洗牌後的 1-100 卡牌陣列
export function generateSeededDeck(seedStr: string): number[] {
  const rng = seededRandom(seedStr);
  const deck = Array.from({ length: 100 }, (_, i) => i + 1);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// 生成隨機洗牌後的 1-100 卡牌陣列 (備用)
export function generateShuffledDeck(): number[] {
  const deck = Array.from({ length: 100 }, (_, i) => i + 1);
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
