"use client";

import React, { useState } from "react";
import { GameStatus } from "../../components/game/GameStatus";
import { PlayerList } from "../../components/game/PlayerList";
import { GameBoard } from "../../components/game/GameBoard";
import { PlayerHand } from "../../components/game/PlayerHand";
import { HostPanel } from "../../components/game/HostPanel";
import { ResultOverlay } from "../../components/game/ResultOverlay";
import { Button } from "../../components/ui/Button";
import { BoardCard } from "../../types/game";

export default function DevUiPlaygroundPage() {
  // Playground Mock States
  const [japaneseTheme, setJapaneseTheme] = useState<"ukiyo" | "urushi" | "matsuba">("ukiyo");
  const [status, setStatus] = useState<"waiting" | "playing" | "locked" | "finished">("playing");
  const [isHost, setIsHost] = useState<boolean>(true);
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [hasCollision, setHasCollision] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [resultStatus, setResultStatus] = useState<"win" | "lose" | null>(null);

  // Mock Hand
  const [myHand, setMyHand] = useState<number[]>([12, 45, 78]);

  // Mock Board
  const [board, setBoard] = useState<BoardCard[]>([
    { uniqueKey: "c1", slotId: "slot-0", cardValue: 12, playerId: "p1", playerName: "風之浪人", placedAt: 1, flipped: status === "finished" },
    { uniqueKey: "c2", slotId: "slot-1", cardValue: 45, playerId: "p2", playerName: "月之雅士", placedAt: 2, flipped: status === "finished" },
  ]);

  const [lockedList, setLockedList] = useState<string[]>([]);

  const handlePlayCard = (val: number) => {
    const targetSlot = selectedSlotId || `slot-${board.length}`;
    setBoard((prev) => [
      ...prev,
      {
        uniqueKey: `card-${Date.now()}`,
        slotId: targetSlot,
        cardValue: val,
        playerId: "p1",
        playerName: "風之浪人",
        placedAt: Date.now(),
        flipped: status === "finished",
      },
    ]);
    setMyHand((prev) => prev.filter((c) => c !== val));
    setSelectedSlotId(null);
  };

  const handleRecallCard = (slotId: string) => {
    const card = board.find((b) => b.slotId === slotId);
    if (card) {
      setMyHand((prev) => [...prev, card.cardValue].sort((a, b) => a - b));
      setBoard((prev) => prev.filter((b) => b.slotId !== slotId));
    }
  };

  const themeClass =
    japaneseTheme === "urushi"
      ? "theme-urushi"
      : japaneseTheme === "matsuba"
      ? "theme-matsuba"
      : "theme-ukiyo";

  return (
    <div className={`w-full min-h-screen bg-ukiyo-bg text-ukiyo-foam py-6 px-4 flex flex-col items-center transition-colors duration-500 ${themeClass}`}>
      {/* Dev Controller Bar */}
      <div className="w-full max-w-4xl bg-ukiyo-surface/90 border border-ukiyo-gold/40 p-4 rounded-2xl mb-6 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs font-serif z-50">
        <div className="flex items-center gap-2 font-bold text-ukiyo-gold">
          <span>🧪 Nippon Colors 日系主題 Playground</span>
          <span className="text-[10px] bg-ukiyo-gold/20 px-2 py-0.5 rounded-full text-ukiyo-gold">Mock Mode</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-ukiyo-mist font-bold">日系色調:</label>
          <select
            value={japaneseTheme}
            onChange={(e) => setJapaneseTheme(e.target.value as any)}
            className="bg-ukiyo-bg border border-ukiyo-gold/40 rounded px-2 py-1 text-ukiyo-gold font-bold focus:outline-none"
          >
            <option value="ukiyo">🌊 浮世繪・濃藍金箔 (Ocean Navy)</option>
            <option value="urushi">漆 黑漆・金箔墨繪 (Urushi Black)</option>
            <option value="matsuba">🌲 松葉・靜寂竹林 (Matsuba Pine)</option>
          </select>

          <label className="text-ukiyo-mist ml-2">狀態:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="bg-ukiyo-bg border border-ukiyo-foam/20 rounded px-2 py-1 text-ukiyo-foam"
          >
            <option value="waiting">Waiting (等待)</option>
            <option value="playing">Playing (出牌中)</option>
            <option value="locked">Locked (鎖定中)</option>
            <option value="finished">Finished (結算完畢)</option>
          </select>

          <Button
            size="sm"
            variant={isHost ? "primary" : "ghost"}
            onClick={() => setIsHost(!isHost)}
          >
            {isHost ? "身份: 房主 (Host)" : "身份: 玩家"}
          </Button>

          <Button
            size="sm"
            variant={hasCollision ? "primary" : "ghost"}
            onClick={() => setHasCollision(!hasCollision)}
          >
            {hasCollision ? "撞牌警示: 開" : "撞牌警示: 關"}
          </Button>

          <Button
            size="sm"
            variant={resultStatus ? "primary" : "ghost"}
            onClick={() => {
              if (!resultStatus) setResultStatus("win");
              else if (resultStatus === "win") setResultStatus("lose");
              else setResultStatus(null);
            }}
          >
            結算彈窗: {resultStatus || "隱藏"}
          </Button>
        </div>
      </div>

      {/* Main Game UI Container */}
      <main className="w-full max-w-4xl flex flex-col justify-between relative py-2 px-2.5 md:px-5 border border-ukiyo-foam/10 rounded-3xl bg-ukiyo-surface/30">
        {/* Top Header */}
        <GameStatus
          roomId="🐶-🚀-🍎"
          connectedCount={3}
          maxPlayers={4}
          playerName="風之浪人 (你)"
          isHost={isHost}
          onOpenHostPanel={() => setIsHostModalOpen(true)}
          onChangePlayerName={() => {}}
        />

        {/* Player List */}
        <PlayerList
          currentConnectionId="p1"
          currentPlayerId="p1"
          hostId="p1"
          lockedList={lockedList}
          others={[
            { presence: { playerId: "p2", playerName: "月之雅士", isReady: true } } as any,
            { presence: { playerId: "p3", playerName: "櫻之劍客", isReady: false } } as any,
          ]}
          selfPresence={{ playerId: "p1", playerName: "風之浪人", isReady: isLocked }}
        />

        {/* Game Board */}
        <GameBoard
          board={board}
          currentConnectionId="p1"
          currentPlayerId="p1"
          status={status}
          totalPlayers={3}
          cardsPerPlayer={3}
          lockedList={lockedList}
          selectedSlotId={selectedSlotId}
          isHost={isHost}
          onRestart={() => {
            setBoard([]);
            setMyHand([12, 45, 78]);
            setStatus("playing");
          }}
          onSelectSlot={(slotId) => setSelectedSlotId(slotId)}
          onRecallCard={handleRecallCard}
          onFlipCard={() => {}}
        />

        {/* Player Hand */}
        {(status === "playing" || status === "locked") && (
          <PlayerHand
            hand={myHand}
            playerName="風之浪人"
            onPlayCard={handlePlayCard}
            isLocked={isLocked}
            lockedCount={lockedList.length}
            totalPlayers={3}
            hasBoardCollision={hasCollision}
            onToggleLock={() => {
              setIsLocked(!isLocked);
              setLockedList((prev) => (prev.includes("p1") ? prev.filter((id) => id !== "p1") : [...prev, "p1"]));
            }}
          />
        )}

        {/* Lobby Waiting state */}
        {status === "waiting" && (
          <div className="w-full glass-panel rounded-2xl p-4 my-2 text-center flex flex-col items-center">
            <p className="text-xs text-ukiyo-mist font-serif mb-3">
              靜候全員入座，點擊下方按鈕即可開局發牌。
            </p>
            {isHost && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStatus("playing")}
                className="font-serif tracking-widest"
              >
                發牌開局
              </Button>
            )}
          </div>
        )}

        {/* Host Panel Modal */}
        <HostPanel
          isHost={isHost}
          isOpen={isHostModalOpen}
          onClose={() => setIsHostModalOpen(false)}
          status={status}
          settings={{ maxPlayers: 4, cardsPerPlayer: 3, showCollisionName: true }}
          onUpdateSettings={() => {}}
        />

        {/* Result Overlay */}
        <ResultOverlay
          result={resultStatus}
          isHost={isHost}
          onRestart={() => setResultStatus(null)}
        />
      </main>
    </div>
  );
}
