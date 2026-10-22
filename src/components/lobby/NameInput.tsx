"use client";

import React from "react";

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
}

export function NameInput({ name, onChange }: NameInputProps) {
  return (
    <div className="flex flex-col space-y-1.5 w-full max-w-xs text-left">
      <label className="text-xs font-black text-[#18181b] tracking-wide">
        你的暱稱
      </label>
      <input
        type="text"
        value={name}
        maxLength={12}
        onChange={(e) => onChange(e.target.value)}
        placeholder="請輸入暱稱..."
        className="w-full bg-[#f4f1ea] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-center text-sm font-black text-[#18181b] placeholder-slate-400 focus:outline-none focus:bg-[#ffffff] shadow-[2px_2px_0px_#18181b] transition-colors"
      />
    </div>
  );
}
