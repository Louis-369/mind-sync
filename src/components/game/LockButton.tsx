"use client";

import React from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "../ui/Button";

interface LockButtonProps {
  isLocked: boolean;
  lockedCount: number;
  totalPlayers: number;
  onToggleLock: () => void;
  disabled?: boolean;
}

export function LockButton({
  isLocked,
  lockedCount,
  totalPlayers,
  onToggleLock,
  disabled = false,
}: LockButtonProps) {
  return (
    <div className="flex flex-col items-center space-y-2 my-2">
      <Button
        variant={isLocked ? "green" : "gold"}
        size="lg"
        onClick={onToggleLock}
        disabled={disabled}
        className="w-full max-w-sm shadow-xl"
      >
        {isLocked ? (
          <span className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-300" /> 已同意心靈同步 (點擊解鎖)
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-amber-200" /> 認可盤面並鎖定同步
          </span>
        )}
      </Button>

      <div className="text-xs font-semibold text-gray-400">
        心靈同步同意進度: <span className="text-poker-accent">{lockedCount}</span> / {totalPlayers} 人
      </div>
    </div>
  );
}
