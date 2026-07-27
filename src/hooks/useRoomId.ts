import { useState, useEffect } from "react";

// 解析 URL Query ?id=xxx 取得房間 ID 的 Hook
export function useRoomId(): string {
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get("id");
        if (idParam) {
          setRoomId(idParam);
        } else {
          // 若無參數則設為預設體驗房間
          setRoomId("🐶-🚀-🍎");
        }
      }
    } catch (error) {
      console.error("解析房間 URL ID 失敗:", error);
    }
    return () => {}; // 清理副作
  }, []);

  return roomId;
}
