"use client";

import React, { useState, useEffect } from "react";
import { Shuffle } from "lucide-react";
import { EMOJI_GROUPS } from "../../lib/constants";
import { buildRoomId } from "../../lib/gameLogic";

interface EmojiPickerProps {
  onRoomSelect: (roomId: string) => void;
}

function getRandomEmoji(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function EmojiPicker({ onRoomSelect }: EmojiPickerProps) {
  const [e1, setE1] = useState<string>(EMOJI_GROUPS.animals[0]);
  const [e2, setE2] = useState<string>(EMOJI_GROUPS.items[0]);
  const [e3, setE3] = useState<string>(EMOJI_GROUPS.foods[0]);

  useEffect(() => {
    setE1(getRandomEmoji(EMOJI_GROUPS.animals));
    setE2(getRandomEmoji(EMOJI_GROUPS.items));
    setE3(getRandomEmoji(EMOJI_GROUPS.foods));
  }, []);

  useEffect(() => {
    onRoomSelect(buildRoomId(e1, e2, e3));
  }, [e1, e2, e3, onRoomSelect]);

  const handleRandomize = () => {
    setE1(getRandomEmoji(EMOJI_GROUPS.animals));
    setE2(getRandomEmoji(EMOJI_GROUPS.items));
    setE3(getRandomEmoji(EMOJI_GROUPS.foods));
  };

  return (
    <div className="flex flex-col items-center space-y-2 w-full max-w-xs text-left">
      <div className="flex items-center justify-between w-full">
        <label className="text-xs font-black text-[#18181b] tracking-wide">
          房間暗號 (對暗號連線)
        </label>
        <button
          type="button"
          onClick={handleRandomize}
          className="text-[11px] text-[#f59e0b] hover:text-amber-600 flex items-center gap-1 font-black cursor-pointer"
        >
          <Shuffle className="w-3 h-3" /> 隨機換一組
        </button>
      </div>

      {/* 3 個 Emoji 選擇列 */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <select
          value={e1}
          onChange={(e) => setE1(e.target.value)}
          className="bg-[#f4f1ea] border-2 border-[#18181b] rounded-xl p-2 text-2xl text-center focus:outline-none focus:bg-[#ffffff] shadow-[2px_2px_0px_#18181b] cursor-pointer"
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
          className="bg-[#f4f1ea] border-2 border-[#18181b] rounded-xl p-2 text-2xl text-center focus:outline-none focus:bg-[#ffffff] shadow-[2px_2px_0px_#18181b] cursor-pointer"
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
          className="bg-[#f4f1ea] border-2 border-[#18181b] rounded-xl p-2 text-2xl text-center focus:outline-none focus:bg-[#ffffff] shadow-[2px_2px_0px_#18181b] cursor-pointer"
        >
          {EMOJI_GROUPS.foods.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>
      </div>

      {/* 預覽展示 */}
      <div className="bg-[#fef3c7] border-2 border-[#18181b] rounded-xl px-3 py-2 text-center w-full flex items-center justify-between shadow-[2px_2px_0px_#18181b]">
        <span className="text-[11px] font-bold text-slate-700">暗號預覽:</span>
        <span className="text-sm font-mono text-[#18181b] font-black tracking-widest">{`${e1} - ${e2} - ${e3}`}</span>
      </div>
    </div>
  );
}
