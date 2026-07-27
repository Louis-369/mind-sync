// 遊戲設定型別
export interface GameSettings {
  maxPlayers: number;           // 人數上限 (2-4人)
  cardsPerPlayer: number;       // 每人發牌數 (1-10張)
  healthSystem: boolean;        // 生命值系統
  shuriken: boolean;            // 手裏劍功能
  levelMode: boolean;           // 關卡晉級模式
  showCollisionName: boolean;   // 顯示碰撞撞牌玩家名稱
}

// 盤面單張卡片放置狀態
export interface BoardCard {
  uniqueKey?: string;           // 盤面 Map 唯一的 key
  slotId?: string;              // 放置槽位 ID
  playerId: string;             // 放置玩家 ID
  playerName: string;           // 放置玩家名稱
  cardValue: number;            // 卡片數值 (1-100)
  flipped: boolean;             // 是否已翻開
  placedAt: number;             // 放置時間戳記
}

// 遊戲全域狀態
export type GameStatus = "waiting" | "playing" | "locked" | "finished";

// 勝負結果
export type GameResult = "win" | "lose" | null;

// 玩家身分資訊
export interface PlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  cardsInHand: number;
}
