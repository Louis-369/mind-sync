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
    return 3;
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
    <Modal isOpen={isOpen} onClose={onClose} title="房間規則設定">
      <div className="space-y-4 text-xs">
        {settings && onUpdateSettings && (
          <div className="grid grid-cols-2 gap-3 bg-[#0d1b2a]/90 p-3.5 rounded-2xl border border-[#d4af37]/30">
            {/* 最大人數 */}
            <div className="flex flex-col">
              <label className="text-slate-300 mb-1.5 font-bold">房間人數上限</label>
              <select
                value={settings.maxPlayers}
                disabled={status !== "waiting"}
                onChange={(e) => handleMaxPlayersChange(Number(e.target.value))}
                className="bg-[#132238] border border-[#d4af37]/40 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value={2}>2 人局 (最多 6 張/人)</option>
                <option value={3}>3 人局 (最多 4 張/人)</option>
                <option value={4}>4 人局 (最多 3 張/人)</option>
              </select>
            </div>

            {/* 每人手牌數 */}
            <div className="flex flex-col">
              <label className="text-slate-300 mb-1.5 font-bold">每人手牌張數</label>
              <select
                value={currentCardsPerPlayer}
                disabled={status !== "waiting"}
                onChange={(e) => onUpdateSettings({ cardsPerPlayer: Number(e.target.value) })}
                className="bg-[#132238] border border-[#d4af37]/40 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                {Array.from({ length: maxAllowedCards }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} 張手牌
                  </option>
                ))}
              </select>
            </div>

            {/* 啟用主題卷軸 */}
            <div className="col-span-2 flex items-center justify-between pt-2.5 border-t border-slate-700/60">
              <div className="flex flex-col">
                <span className="text-white font-bold">啟用情境題目</span>
                <span className="text-[11px] text-slate-400 font-medium">關閉後進入純數字心電感應模式</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ showTopic: settings.showTopic === false ? true : false })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border border-[#d4af37]/40 cursor-pointer ${
                  settings.showTopic !== false ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showTopic !== false ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* 儲存按鈕 */}
        <div className="pt-1">
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 font-black"
          >
            <Check className="w-4 h-4 text-slate-950" /> 完成設定
          </Button>
        </div>
      </div>
    </Modal>
  );
}
