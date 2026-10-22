"use client";

import React from "react";

interface NameInputProps {
  name: string;
  onChange: (name: string) => void;
}

export function NameInput({ name, onChange }: NameInputProps) {
  return (
    <div className="flex flex-col space-y-1.5 w-full max-w-xs font-mono">
      <label className="text-[11px] font-bold text-[#00e5ff] tracking-wider text-left">
        &gt; SET_OPERATOR_ID [特工代號]
      </label>
      <input
        type="text"
        value={name}
        maxLength={14}
        onChange={(e) => onChange(e.target.value)}
        placeholder="INPUT_ID..."
        className="bg-[#020406] border-2 border-[#00ff9d] px-3 py-2 text-center text-sm font-mono text-[#00ff9d] placeholder-[#00ff9d]/30 focus:outline-none focus:shadow-[0_0_12px_#00ff9d] transition-all"
      />
    </div>
  );
}
