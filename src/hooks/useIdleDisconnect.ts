"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * 監聽使用者操作，若超過 timeoutMs 無任何互動則觸發閒置狀態 (isIdle = true)
 * 預設為 5 分鐘 (300,000 ms)
 */
export function useIdleDisconnect(timeoutMs: number = 5 * 60 * 1000) {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const isIdleRef = useRef<boolean>(false);

  useEffect(() => {
    isIdleRef.current = isIdle;
  }, [isIdle]);

  const resetTimer = useCallback(() => {
    isIdleRef.current = false;
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleUserActivity = () => {
      if (isIdleRef.current) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        isIdleRef.current = true;
        setIsIdle(true);
      }, timeoutMs);
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // 啟動初始計時器
    timer = setTimeout(() => {
      isIdleRef.current = true;
      setIsIdle(true);
    }, timeoutMs);

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [timeoutMs]);

  return { isIdle, resetTimer };
}
