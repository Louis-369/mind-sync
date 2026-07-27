"use client";

import React from "react";
import { Play, Eye, RotateCcw } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { GameSettings } from "../../types/game";

interface HostPanelProps {
  isHost: boolean;
  isOpen: boolean;
  onClose: () => void;
  status: string;
  settings: GameSettings | null;
  onDealCards: () => void;
  onFlipAll: () => void;
  onResetGame: () => void;
  onUpdateSettings?: (newSettings: Partial<GameSettings>) => void;
}

export function HostPanel({
  isHost,
  isOpen,
  onClose,
  status,
  settings,
  onDealCards,
  onFlipAll,
  onResetGame,
  onUpdateSettings,
}: HostPanelProps) {
  if (!isHost) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="房主設定面板">
      <div className="space-y-4 font-sans">
        {/* 設定選項 */}
        {settings && onUpdateSettings && status === "waiting" && (
          <div className="grid grid-cols-2 gap-3 bg-ukiyo-surface/80 p-3.5 rounded-xl border border-ukiyo-foam/10">
            <div className="flex flex-col">
              <label className="text-xs text-ukiyo-mist mb-1 font-serif">每人發牌張數</label>
              <input
                type="number"
                min={1}
                max={10}
                value={settings.cardsPerPlayer}
                onChange={(e) => onUpdateSettings({ cardsPerPlayer: Number(e.target.value) })}
                className="bg-ukiyo-bg border border-ukiyo-foam/20 rounded px-2.5 py-1 text-sm text-center text-ukiyo-foam"
              />
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-ukiyo-foam">
                <input
                  type="checkbox"
                  checked={settings.shuriken}
                  onChange={(e) => onUpdateSettings({ shuriken: e.target.checked })}
                  className="accent-ukiyo-gold"
                />
                <span>啟用手裏劍</span>
              </label>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-ukiyo-foam">
                <input
                  type="checkbox"
                  checked={settings.healthSystem}
                  onChange={(e) => onUpdateSettings({ healthSystem: e.target.checked })}
                  className="accent-ukiyo-gold"
                />
                <span>生命值扣除</span>
              </label>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-ukiyo-foam">
                <input
                  type="checkbox"
                  checked={settings.showCollisionName}
                  onChange={(e) => onUpdateSettings({ showCollisionName: e.target.checked })}
                  className="accent-ukiyo-gold"
                />
                <span>顯示撞牌姓名</span>
              </label>
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex flex-col gap-2 pt-2">
          {status === "waiting" && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onDealCards();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-ukiyo-gold" /> 發牌並開始遊戲
            </Button>
          )}

          {(status === "playing" || status === "locked") && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                onFlipAll();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-ukiyo-gold" /> 一鍵亮牌判定
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onResetGame();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-ukiyo-mist"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重置房間大廳
          </Button>
        </div>
      </div>
    </Modal>
  );
}
