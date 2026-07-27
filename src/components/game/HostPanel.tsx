"use client";

import React from "react";
import { Check } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { GameSettings } from "../../types/game";

interface HostPanelProps {
  isHost: boolean;
  isOpen: boolean;
  onClose: () => void;
  status: string;
  settings: GameSettings | null;
  onUpdateSettings?: (newSettings: Partial<GameSettings>) => void;
}

export function HostPanel({
  isHost,
  isOpen,
  onClose,
  status,
  settings,
  onUpdateSettings,
}: HostPanelProps) {
  const getMaxCardsForPlayers = (numPlayers: number) => {
    if (numPlayers === 2) return 6;
    if (numPlayers === 3) return 4;
    return 3; // 4 人遊戲最高 3 張
  };

  const maxAllowedCards = settings ? getMaxCardsForPlayers(settings.maxPlayers) : 6;
  const currentCardsPerPlayer = settings ? Math.min(settings.cardsPerPlayer, maxAllowedCards) : 2;

  const handleMaxPlayersChange = (newMax: number) => {
    if (!onUpdateSettings) return;
    const maxForNew = getMaxCardsForPlayers(newMax);
    const newCardsPerPlayer = Math.min(settings?.cardsPerPlayer || 2, maxForNew);
    onUpdateSettings({ maxPlayers: newMax, cardsPerPlayer: newCardsPerPlayer });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="房主規則設定">
      <div className="space-y-4 font-serif">
        {settings && onUpdateSettings && (
          <div className="grid grid-cols-2 gap-3 bg-ukiyo-surface/80 p-4 rounded-xl border border-ukiyo-foam/10">
            {/* 最大人數選單 */}
            <div className="flex flex-col">
              <label className="text-xs text-ukiyo-mist mb-1 font-bold">房間人數上限</label>
              <select
                value={settings.maxPlayers}
                disabled={status !== "waiting"}
                onChange={(e) => handleMaxPlayersChange(Number(e.target.value))}
                className="bg-ukiyo-bg border border-ukiyo-foam/20 rounded-lg px-2.5 py-1.5 text-xs text-ukiyo-foam focus:outline-none focus:border-ukiyo-gold cursor-pointer"
              >
                <option value={2}>2 人席 (最高 6 張)</option>
                <option value={3}>3 人席 (最高 4 張)</option>
                <option value={4}>4 人席 (最高 3 張)</option>
              </select>
            </div>

            {/* 每人發牌數選單 */}
            <div className="flex flex-col">
              <label className="text-xs text-ukiyo-mist mb-1 font-bold">每人手牌張數</label>
              <select
                value={currentCardsPerPlayer}
                disabled={status !== "waiting"}
                onChange={(e) => onUpdateSettings({ cardsPerPlayer: Number(e.target.value) })}
                className="bg-ukiyo-bg border border-ukiyo-foam/20 rounded-lg px-2.5 py-1.5 text-xs text-ukiyo-foam focus:outline-none focus:border-ukiyo-gold cursor-pointer"
              >
                {Array.from({ length: maxAllowedCards }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} 張
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 儲存按鈕 */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 tracking-widest font-serif"
          >
            <Check className="w-4 h-4 text-ukiyo-gold" /> 確認設定
          </Button>
        </div>
      </div>
    </Modal>
  );
}
