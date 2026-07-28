import { LiveObject, LiveMap, LiveList } from "@liveblocks/client";

// 定義 Liveblocks Storage 與 Presence 全域型別
declare global {
  interface Liveblocks {
    // 玩家連線即時狀態 (Presence)
    Presence: {
      playerId: string;
      playerName: string;
      isReady: boolean;
    };

    // 共享持久狀態 (Storage)
    Storage: {
      // 遊戲規則設定
      settings: LiveObject<{
        maxPlayers: number;
        cardsPerPlayer: number;
        healthSystem: boolean;
        shuriken: boolean;
        levelMode: boolean;
        showCollisionName: boolean;
      }>;
      
      // 盤面位置與卡片對照 (位置索引 string -> BoardCard)
      board: LiveMap<string, LiveObject<{
        playerId: string;
        playerName: string;
        cardValue: number;
        flipped: boolean;
        placedAt: number;
        slotId?: string;
      }>>;
      
      // 已手動鎖定的玩家 ID 陣列
      lockedPlayers: LiveList<string>;

      // 玩家進入房間的歷史時間順序 ID 陣列 (用於精準順位繼承房主與防擠退)
      playerJoinOrder: LiveList<string>;
      
      // 各玩家當前手牌列表 (playerId -> LiveList<number>)
      hands: LiveMap<string, LiveList<number>>;
      
      // 遊戲主狀態
      status: "waiting" | "playing" | "locked" | "finished";
      
      // 勝負結果
      result: "win" | "lose" | null;
      
      // 房主 ID
      hostId: string;
      
      // 當前生命值
      lives: number;
      
      // 手裏劍剩餘次數
      shurikens: number;
      
      // 當前關卡
      currentLevel: number;
    };
  }
}

export {};
