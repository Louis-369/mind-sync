"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * 監聽使用者操作，若超過 timeoutMs 無任何互動則觸發閒置狀態 (isIdle = true)
 * 預設為 5 分鐘 (300,000 ms)
 */
export function useIdleDisconnect(timeoutMs: number = 5 * 60 * 1000) {
  const [isIdle, setIsIdle] = useState<boolean>(false);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleUserActivity = () => {
      if (isIdle) return; // 已處於閒置斷線狀態，需手動點擊按鈕恢復
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsIdle(true);
      }, timeoutMs);
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // 啟動初始計時器
    timer = setTimeout(() => {
      setIsIdle(true);
    }, timeoutMs);

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [timeoutMs, isIdle]);

  return { isIdle, resetTimer };
}
