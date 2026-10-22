"use client";

import React, { useMemo } from "react";

const CALLIGRAPHY_CHARS = [
  "心", "秤", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾",
  "和", "氣", "共", "鳴", "默", "契", "波", "紋", "·", "─", "┼", "※", "⚖", "🎴",
];

export function CalligraphyMatrix() {
  // 生成固定偽隨機字符陣列以維持水波呼吸效果（避免每次 render 重新隨機）
  const columns = useMemo(() => {
    const colCount = 12; // 12 欄
    const rowCount = 10; // 10 列
    const grid: { char: string; delay: string; duration: string }[][] = [];

    for (let c = 0; c < colCount; c++) {
      const col = [];
      for (let r = 0; r < rowCount; r++) {
        const charIdx = (c * 7 + r * 11) % CALLIGRAPHY_CHARS.length;
        const delay = ((c * 0.4 + r * 0.3) % 4).toFixed(1) + "s";
        const duration = (6 + ((c + r) % 5)).toFixed(1) + "s";
        col.push({
          char: CALLIGRAPHY_CHARS[charIdx],
          delay,
          duration,
        });
      }
      grid.push(col);
    }
    return grid;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 flex justify-around items-stretch opacity-[0.038] dark:opacity-[0.045] mix-blend-screen"
    >
      {columns.map((col, colIdx) => (
        <div
          key={`col-${colIdx}`}
          className="flex flex-col justify-around items-center font-serif text-ukiyo-gold text-sm sm:text-base md:text-lg"
        >
          {col.map((item, rowIdx) => (
            <span
              key={`cell-${colIdx}-${rowIdx}`}
              style={{
                animation: `matrixWave ${item.duration} ease-in-out infinite alternate`,
                animationDelay: item.delay,
              }}
              className="transition-transform duration-1000 inline-block"
            >
              {item.char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
