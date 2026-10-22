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
    <Modal isOpen={isOpen} onClose={onClose} title="SYS://ROOT_CONFIG">
      <div className="space-y-4 font-mono text-xs">
        {settings && onUpdateSettings && (
          <div className="grid grid-cols-2 gap-3 bg-[#04080e] p-3 border border-[#00ff9d]/40">
            {/* 最大特工席位 */}
            <div className="flex flex-col">
              <label className="text-[#00e5ff] mb-1 font-bold">MAX_NODES (人數上限)</label>
              <select
                value={settings.maxPlayers}
                disabled={status !== "waiting"}
                onChange={(e) => handleMaxPlayersChange(Number(e.target.value))}
                className="bg-[#030609] border border-[#00ff9d]/40 px-2 py-1 text-xs text-[#00ff9d] focus:outline-none focus:border-[#00ff9d]"
              >
                <option value={2}>2 NODES (MAX 6 CARTS)</option>
                <option value={3}>3 NODES (MAX 4 CARTS)</option>
                <option value={4}>4 NODES (MAX 3 CARTS)</option>
              </select>
            </div>

            {/* 每位特工配發卡匣數 */}
            <div className="flex flex-col">
              <label className="text-[#00e5ff] mb-1 font-bold">CARTS_PER_OP (卡匣張數)</label>
              <select
                value={currentCardsPerPlayer}
                disabled={status !== "waiting"}
                onChange={(e) => onUpdateSettings({ cardsPerPlayer: Number(e.target.value) })}
                className="bg-[#030609] border border-[#00ff9d]/40 px-2 py-1 text-xs text-[#00ff9d] focus:outline-none focus:border-[#00ff9d]"
              >
                {Array.from({ length: maxAllowedCards }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} PACKETS
                  </option>
                ))}
              </select>
            </div>

            {/* 啟用基準測試橫幅 */}
            <div className="col-span-2 flex items-center justify-between pt-2 border-t border-[#00ff9d]/20">
              <div className="flex flex-col">
                <span className="text-[#00ff9d] font-bold">ENABLE_BENCHMARK_QUERY</span>
                <span className="text-[10px] text-[#00ff9d]/60">關閉後進入純數字頻率同步模式</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ showTopic: settings.showTopic === false ? true : false })}
                className={`relative inline-flex h-5 w-10 items-center border transition-colors ${
                  settings.showTopic !== false ? "bg-[#00ff9d] border-[#00ff9d]" : "bg-black border-[#00ff9d]/30"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform transition-transform ${
                    settings.showTopic !== false ? "translate-x-5 bg-black" : "translate-x-0.5 bg-[#00ff9d]/50"
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
            className="w-full flex items-center justify-center gap-1.5 font-mono font-bold"
          >
            <Check className="w-4 h-4 text-black" /> [APPLY_SYS_CONFIG]
          </Button>
        </div>
      </div>
    </Modal>
  );
}
