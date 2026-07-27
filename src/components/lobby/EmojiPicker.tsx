"use client";

import React, { useState, useEffect } from "react";
import { EMOJI_GROUPS } from "../../lib/constants";
import { buildRoomId } from "../../lib/gameLogic";

interface EmojiPickerProps {
  onRoomSelect: (roomId: string) => void;
}

// 隨機選取陣列中的一個元素
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
    <div className="flex flex-col items-center space-y-3 w-full">
      <label className="text-xs font-serif font-bold text-ukiyo-gold tracking-widest uppercase">
        選擇房間暗號 (配對代碼)
      </label>

      {/* 3 個 Emoji 選擇列 */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs">
        {/* 第一組: 動物 */}
        <select
          value={e1}
          onChange={(e) => setE1(e.target.value)}
          className="bg-ukiyo-surface/90 border border-ukiyo-foam/20 rounded-xl p-2.5 text-2xl text-center focus:outline-none focus:border-ukiyo-gold cursor-pointer transition-colors"
        >
          {EMOJI_GROUPS.animals.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>

        {/* 第二組: 物品 */}
        <select
          value={e2}
          onChange={(e) => setE2(e.target.value)}
          className="bg-ukiyo-surface/90 border border-ukiyo-foam/20 rounded-xl p-2.5 text-2xl text-center focus:outline-none focus:border-ukiyo-gold cursor-pointer transition-colors"
        >
          {EMOJI_GROUPS.items.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>

        {/* 第三組: 食物 */}
        <select
          value={e3}
          onChange={(e) => setE3(e.target.value)}
          className="bg-ukiyo-surface/90 border border-ukiyo-foam/20 rounded-xl p-2.5 text-2xl text-center focus:outline-none focus:border-ukiyo-gold cursor-pointer transition-colors"
        >
          {EMOJI_GROUPS.foods.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>
      </div>

      {/* 預覽展示 */}
      <div className="bg-ukiyo-surface/60 border border-ukiyo-foam/10 rounded-xl px-4 py-1.5 text-center">
        <span className="text-[10px] text-ukiyo-mist block mb-0.5 font-serif">暗號預覽</span>
        <span className="text-base font-mono text-ukiyo-gold tracking-widest">{`${e1} ${e2} ${e3}`}</span>
      </div>
    </div>
  );
}
