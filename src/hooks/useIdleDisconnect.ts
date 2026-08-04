"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * 監聽使用者操作與視窗可見度，提供 30 秒閒置預警 (isWarning) 與 5 分鐘實體斷線 (isIdle)
 * 預設 warningMs = 4.5 分鐘 (270,000 ms)，timeoutMs = 5 分鐘 (300,000 ms)
 */
export function useIdleDisconnect(
  warningMs: number = 4.5 * 60 * 1000,
  timeoutMs: number = 5 * 60 * 1000
) {
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);

  const isWarningRef = useRef<boolean>(false);
  const isIdleRef = useRef<boolean>(false);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    isWarningRef.current = false;
    isIdleRef.current = false;
    setIsWarning(false);
    setIsIdle(false);
    setRemainingSeconds(30);

    // 重新啟動預警計時器
    warningTimerRef.current = setTimeout(() => {
      isWarningRef.current = true;
      setIsWarning(true);
      setRemainingSeconds(Math.round((timeoutMs - warningMs) / 1000));

      // 啟動 1 秒倒數計時器
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 啟動最終斷線計時器
      disconnectTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
        setIsIdle(true);
        setIsWarning(false);
      }, timeoutMs - warningMs);
    }, warningMs);
  }, [clearAllTimers, warningMs, timeoutMs]);

  useEffect(() => {
    const handleUserActivity = () => {
      // 若已進入完全斷線狀態則不再自動重置
      if (isIdleRef.current) return;
      // 若在預警狀態，使用者點擊或觸控則自動重置
      resetTimer();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!isIdleRef.current) {
          resetTimer();
        }
      }
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 啟動初始計時器
    resetTimer();

    return () => {
      clearAllTimers();
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resetTimer, clearAllTimers]);

  return { isWarning, isIdle, remainingSeconds, resetTimer };
}
