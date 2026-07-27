"use client";

import React from "react";

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
}

export function NameInput({ name, onChange }: NameInputProps) {
  return (
    <div className="flex flex-col space-y-2 w-full max-w-xs">
      <label className="text-xs font-serif font-bold text-ukiyo-gold tracking-widest uppercase text-center">
        你的心靈稱號
      </label>
      <input
        type="text"
        value={name}
        maxLength={12}
        onChange={(e) => onChange(e.target.value)}
        placeholder="請輸入暱稱..."
        className="bg-ukiyo-surface/90 border border-ukiyo-foam/20 rounded-xl px-4 py-3 text-center text-base font-serif text-ukiyo-foam placeholder-ukiyo-mist focus:outline-none focus:border-ukiyo-gold transition-colors shadow-inner"
      />
    </div>
  );
}
