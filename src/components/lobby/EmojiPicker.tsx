"use client";

import React, { useState, useEffect } from "react";
import { EMOJI_GROUPS } from "../../lib/constants";
import { buildRoomId } from "../../lib/gameLogic";

interface EmojiPickerProps {
  onRoomSelect: (roomId: string) => void;
}

function getRandomEmoji(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function EmojiPicker({ onRoomSelect }: EmojiPickerProps) {
  const [e1, setE1] = useState(() => getRandomEmoji(EMOJI_GROUPS.animals));
  const [e2, setE2] = useState(() => getRandomEmoji(EMOJI_GROUPS.items));
  const [e3, setE3] = useState(() => getRandomEmoji(EMOJI_GROUPS.foods));

  useEffect(() => {
    onRoomSelect(buildRoomId(e1, e2, e3));
    return () => {};
  }, [e1, e2, e3, onRoomSelect]);

  return (
    <div className="flex flex-col items-center space-y-2 w-full max-w-xs text-left">
      <label className="text-xs font-bold text-slate-300 tracking-wide w-full">
        選擇房間暗號 (快速配對)
      </label>

      {/* 3 個 Emoji 選擇列 */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <select
          value={e1}
          onChange={(e) => setE1(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-2xl text-center focus:outline-none focus:border-[#f59e0b] cursor-pointer"
        >
          {EMOJI_GROUPS.animals.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>

        <select
          value={e2}
          onChange={(e) => setE2(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-2xl text-center focus:outline-none focus:border-[#f59e0b] cursor-pointer"
        >
          {EMOJI_GROUPS.items.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>

        <select
          value={e3}
          onChange={(e) => setE3(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-2xl text-center focus:outline-none focus:border-[#f59e0b] cursor-pointer"
        >
          {EMOJI_GROUPS.foods.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>
      </div>

      {/* 預覽展示 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-center w-full flex items-center justify-between">
        <span className="text-[11px] text-slate-400">暗號預覽:</span>
        <span className="text-sm font-mono text-[#f59e0b] font-bold tracking-widest">{`${e1} - ${e2} - ${e3}`}</span>
      </div>
    </div>
  );
}
