import { useState, useEffect } from "react";
import { RANDOM_NAMES } from "../lib/constants";

// 玩家身分 Hook，管理 UUID 與 暱稱
export function usePlayerId(): { playerId: string; playerName: string; setPlayerName: (name: string) => void } {
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerNameState] = useState<string>("");

  useEffect(() => {
    try {
      // 讀取或建立持久化 UUID
      let storedId = localStorage.getItem("mind_sync_player_id");
      if (!storedId) {
        storedId = `player-${crypto.randomUUID()}`;
        localStorage.setItem("mind_sync_player_id", storedId);
      }
      setPlayerId(storedId);

      // 讀取或建立預設暱稱
      let storedName = localStorage.getItem("mind_sync_player_name");
      if (!storedName) {
        const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
        storedName = `${randomName}_${Math.floor(100 + Math.random() * 900)}`;
        localStorage.setItem("mind_sync_player_name", storedName);
      }
      setPlayerNameState(storedName);
    } catch (error) {
      console.error("讀取或儲存玩家 UUID 失敗:", error);
      // 備用隨機生成
      setPlayerId(`player-${Math.random().toString(36).substring(2, 9)}`);
      setPlayerNameState("心靈玩家");
    }

    return () => {}; // 清理副作
  }, []);

  const setPlayerName = (newName: string) => {
    try {
      setPlayerNameState(newName);
      localStorage.setItem("mind_sync_player_name", newName);
    } catch (error) {
      console.error("更新玩家暱稱失敗:", error);
    }
  };

  return { playerId, playerName, setPlayerName };
}
