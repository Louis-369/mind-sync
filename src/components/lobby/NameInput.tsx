"use client";

import React from "react";

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
}

export function NameInput({ name, onChange }: NameInputProps) {
  return (
    <div className="flex flex-col space-y-1.5 w-full max-w-xs text-left">
      <label className="text-xs font-bold text-slate-300 tracking-wide">
        你的暱稱
      </label>
      <input
        type="text"
        value={name}
        maxLength={12}
        onChange={(e) => onChange(e.target.value)}
        placeholder="請輸入暱稱..."
        className="w-full bg-[#0d1b2a] border border-[#d4af37]/40 rounded-xl px-3.5 py-2.5 text-center text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] shadow-inner transition-colors"
      />
    </div>
  );
}
