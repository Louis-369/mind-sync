"use client";

import React from "react";

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
}

export function NameInput({ name, onChange }: NameInputProps) {
  return (
    <div className="flex flex-col space-y-2 w-full max-w-xs">
      <label className="text-sm font-semibold text-poker-accent tracking-wider uppercase text-center">
        你的心靈暱稱
      </label>
      <input
        type="text"
        value={name}
        maxLength={12}
        onChange={(e) => onChange(e.target.value)}
        placeholder="請輸入暱稱..."
        className="bg-poker-bg/80 border-2 border-poker-accent/40 rounded-xl px-4 py-3 text-center text-lg text-white placeholder-gray-500 focus:outline-none focus:border-poker-accent transition-colors shadow-inner"
      />
    </div>
  );
}
