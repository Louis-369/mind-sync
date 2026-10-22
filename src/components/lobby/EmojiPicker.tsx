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
    <div className="flex flex-col items-center space-y-2.5 w-full font-mono">
      <label className="text-[11px] font-bold text-[#00e5ff] tracking-wider text-left w-full max-w-xs">
        &gt; CRYPTO_CHANNEL [加密頻道金鑰]
      </label>

      {/* 3 個 Emoji 選擇列 */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs">
        <select
          value={e1}
          onChange={(e) => setE1(e.target.value)}
          className="bg-[#020406] border border-[#00ff9d]/60 p-2 text-2xl text-center focus:outline-none focus:border-[#00e5ff] cursor-pointer"
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
          className="bg-[#020406] border border-[#00ff9d]/60 p-2 text-2xl text-center focus:outline-none focus:border-[#00e5ff] cursor-pointer"
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
          className="bg-[#020406] border border-[#00ff9d]/60 p-2 text-2xl text-center focus:outline-none focus:border-[#00e5ff] cursor-pointer"
        >
          {EMOJI_GROUPS.foods.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>
      </div>

      {/* 預覽展示 */}
      <div className="bg-black/80 border border-[#00ff9d]/30 px-3 py-1 text-center w-full max-w-xs flex items-center justify-between">
        <span className="text-[10px] text-[#00ff9d]/60 font-mono">CHANNEL_KEY:</span>
        <span className="text-sm font-mono text-[#00ff9d] font-bold tracking-widest">{`${e1} :: ${e2} :: ${e3}`}</span>
      </div>
    </div>
  );
}
