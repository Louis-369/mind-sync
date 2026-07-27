import { GameSettings } from "../types/game";

// 預設 Liveblocks Public Key (未設定環境變數時備用)
export const DEFAULT_PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_placeholder_key_mind_sync";

// 房間名稱 Emoji 選項清單 (分三組供玩家搭配選擇)
export const EMOJI_GROUPS = {
  animals: ["🐶", "🐱", "🦊", "🦁", "🐸", "🐵", "🦄", "🦉"],
  items: ["🚗", "🚀", "🎮", "🎸", "💎", "👑", "🔮", "⚡"],
  foods: ["🍎", "🍕", "🍔", "🍣", "🍩", "🍦", "🥑", "🍟"],
};

// 預設遊戲設定
export const DEFAULT_SETTINGS: GameSettings = {
  maxPlayers: 4,
  cardsPerPlayer: 2,
  healthSystem: true,
  shuriken: true,
  levelMode: true,
  showCollisionName: true,
};

// 預設玩家隨機稱號
export const RANDOM_NAMES = [
  "秤心者", "調頻師", "默契匠", "平衡者",
  "幸運星", "牌皇", "閃電俠", "終極玩家"
];
