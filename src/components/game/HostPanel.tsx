"use client";

import React from "react";
import { Settings, Play, Eye, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";
import { GameSettings } from "../../types/game";

interface HostPanelProps {
  isHost: boolean;
  status: string;
  settings: GameSettings | null;
  onDealCards: () => void;
  onFlipAll: () => void;
  onResetGame: () => void;
  onUpdateSettings?: (newSettings: Partial<GameSettings>) => void;
}

export function HostPanel({
  isHost,
  status,
  settings,
  onDealCards,
  onFlipAll,
  onResetGame,
  onUpdateSettings,
}: HostPanelProps) {
  if (!isHost) {
    return (
      <div className="w-full glass-card rounded-xl p-3 text-center text-xs text-gray-400">
        等待房主啟動遊戲或調整設定...
      </div>
    );
  }

  return (
    <div className="w-full glass-panel rounded-2xl p-4 my-4 border-amber-500/40">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-poker-accent flex items-center gap-1.5">
          <Settings className="w-4 h-4" /> 房主控制面板
        </h3>
        <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
          房主權限生效中
        </span>
      </div>

      {/* 設定開關列 */}
      {settings && onUpdateSettings && status === "waiting" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-poker-bg/50 p-3 rounded-xl border border-white/5">
          <div className="flex flex-col">
            <label className="text-xs text-gray-400 mb-1">每人發牌數</label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.cardsPerPlayer}
              onChange={(e) => onUpdateSettings({ cardsPerPlayer: Number(e.target.value) })}
              className="bg-poker-bg border border-poker-accent/40 rounded px-2 py-1 text-sm text-center text-white"
            />
          </div>

          <div className="flex flex-col justify-center">
            <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={settings.shuriken}
                onChange={(e) => onUpdateSettings({ shuriken: e.target.checked })}
                className="accent-poker-accent"
              />
              <span>啟用手裏劍</span>
            </label>
          </div>

          <div className="flex flex-col justify-center">
            <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={settings.healthSystem}
                onChange={(e) => onUpdateSettings({ healthSystem: e.target.checked })}
                className="accent-poker-accent"
              />
              <span>生命值扣除</span>
            </label>
          </div>

          <div className="flex flex-col justify-center">
            <label className="flex items-center space-x-2 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={settings.showCollisionName}
                onChange={(e) => onUpdateSettings({ showCollisionName: e.target.checked })}
                className="accent-poker-accent"
              />
              <span>顯示撞牌姓名</span>
            </label>
          </div>
        </div>
      )}

      {/* 操作按鈕群 */}
      <div className="flex flex-wrap gap-3 justify-center">
        {status === "waiting" && (
          <Button variant="gold" onClick={onDealCards} className="flex items-center gap-2">
            <Play className="w-4 h-4" /> 開始發牌與遊戲
          </Button>
        )}

        {(status === "playing" || status === "locked") && (
          <Button variant="green" onClick={onFlipAll} className="flex items-center gap-2">
            <Eye className="w-4 h-4" /> 一鍵翻開盤面卡牌判定
          </Button>
        )}

        <Button variant="ghost" onClick={onResetGame} className="flex items-center gap-2 text-xs">
          <RotateCcw className="w-3.5 h-3.5" /> 重置房間
        </Button>
      </div>
    </div>
  );
}
