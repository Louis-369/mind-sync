"use client";

import React, { useState, useEffect } from "react";
import { EMOJI_GROUPS } from "../../lib/constants";
import { buildRoomId } from "../../lib/gameLogic";

interface EmojiPickerProps {
  onRoomSelect: (roomId: string) => void;
}

export function EmojiPicker({ onRoomSelect }: EmojiPickerProps) {
  const [e1, setE1] = useState(EMOJI_GROUPS.animals[0]);
  const [e2, setE2] = useState(EMOJI_GROUPS.items[0]);
  const [e3, setE3] = useState(EMOJI_GROUPS.foods[0]);

  useEffect(() => {
    onRoomSelect(buildRoomId(e1, e2, e3));
    return () => {};
  }, [e1, e2, e3, onRoomSelect]);

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <label className="text-sm font-semibold text-poker-accent tracking-wider uppercase">
        選擇房間暗號 Emoji (配對代碼)
      </label>

      {/* 3 個 Emoji 選擇列 */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {/* 第一組: 動物 */}
        <select
          value={e1}
          onChange={(e) => setE1(e.target.value)}
          className="bg-ukiyo-surface/90 border border-ukiyo-foam/20 rounded-xl p-3 text-2xl text-center focus:outline-none focus:border-ukiyo-gold cursor-pointer transition-colors"
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
          className="bg-ukiyo-surface/90 border border-ukiyo-foam/20 rounded-xl p-3 text-2xl text-center focus:outline-none focus:border-ukiyo-gold cursor-pointer transition-colors"
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
          className="bg-ukiyo-surface/90 border border-ukiyo-foam/20 rounded-xl p-3 text-2xl text-center focus:outline-none focus:border-ukiyo-gold cursor-pointer transition-colors"
        >
          {EMOJI_GROUPS.foods.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>
      </div>

      {/* 預覽展示 */}
      <div className="bg-poker-bg/60 border border-white/10 rounded-lg px-4 py-2 text-center">
        <span className="text-xs text-gray-400 block mb-0.5">房間識別碼</span>
        <span className="text-lg font-mono text-poker-neonGold tracking-wider">{`${e1} ${e2} ${e3}`}</span>
      </div>
    </div>
  );
}
