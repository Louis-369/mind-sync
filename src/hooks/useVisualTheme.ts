"use client";

import { useState, useEffect } from "react";

export type VisualTheme = "ascii" | "ukiyo";

const THEME_STORAGE_KEY = "mind_sync_visual_theme_v1";

export function useVisualTheme() {
  // develop 分支預設直接載入 "ascii" 魔術主題
  const [theme, setTheme] = useState<VisualTheme>("ascii");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as VisualTheme | null;
      if (saved === "ukiyo" || saved === "ascii") {
        setTheme(saved);
        applyThemeClass(saved);
      } else {
        // 預設為 ascii
        setTheme("ascii");
        applyThemeClass("ascii");
      }
    } catch {
      applyThemeClass("ascii");
    }
  }, []);

  const applyThemeClass = (targetTheme: VisualTheme) => {
    if (typeof document !== "undefined") {
      if (targetTheme === "ascii") {
        document.body.classList.add("theme-ascii");
      } else {
        document.body.classList.remove("theme-ascii");
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme: VisualTheme = theme === "ascii" ? "ukiyo" : "ascii";
    setTheme(nextTheme);
    applyThemeClass(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      console.warn("無法儲存主題偏好:", e);
    }
  };

  return {
    theme,
    isAscii: theme === "ascii",
    toggleTheme,
    mounted,
  };
}
