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
        connectionId?: string;
      }>>;
      
      // 已手動鎖定的玩家 ID 陣列
      lockedPlayers: LiveList<string>;

      // 玩家進入房間的歷史時間順序 ID 陣列 (用於精準順位繼承房主與防擠退)
      playerJoinOrder: LiveList<string>;
      
      // 開局時顯式分配的玩家席位 mapping (playerId -> slotIndex 0, 1, 2...)
      playerSlots: LiveMap<string, number>;

      // 各玩家當前剩餘手牌張數 (playerId -> number) (防透視作弊與節省頻寬)
      handCounts: LiveMap<string, number>;

      // 最新發牌時間戳記 (用於本機確定性洗牌與手牌發放)
      dealTimestamp: number;
      
      // 遊戲主狀態
      status: "waiting" | "playing" | "locked" | "finished";
      
      // 勝負結果
      result: "win" | "lose" | null;
      
      // 房主 ID
      hostId: string;
    };
  }
}

export {};
