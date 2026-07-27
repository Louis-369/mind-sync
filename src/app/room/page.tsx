"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useRoomId } from "../../hooks/useRoomId";
import { usePlayerId } from "../../hooks/usePlayerId";
import { useGameState } from "../../hooks/useGameState";
import { LiveblocksWrapper } from "../../components/providers/LiveblocksWrapper";
import { GameStatus } from "../../components/game/GameStatus";
import { PlayerList } from "../../components/game/PlayerList";
import { GameBoard } from "../../components/game/GameBoard";
import { PlayerHand } from "../../components/game/PlayerHand";
import { LockButton } from "../../components/game/LockButton";
import { HostPanel } from "../../components/game/HostPanel";
import { ResultOverlay } from "../../components/game/ResultOverlay";
import { Button } from "../../components/ui/Button";

function RoomInner() {
  const router = useRouter();
  const roomId = useRoomId();
  const { playerId, playerName } = usePlayerId();

  const {
    settings,
    board,
    lockedList,
    status,
    result,
    hostId,
    lives,
    shurikens,
    currentLevel,
    myHand,
    self,
    others,
    updateMyPresence,
    dealCards,
    placeCard,
    recallCard,
    toggleLock,
    flipCard,
    useShuriken,
    updateSettings,
    resetGame,
  } = useGameState();

  // 更新 Presence
  useEffect(() => {
    try {
      if (playerId && playerName) {
        updateMyPresence({
          playerId,
          playerName,
          isReady: false,
        });
      }
    } catch (error) {
      console.error("更新玩家 Presence 失敗:", error);
    }
    return () => {};
  }, [playerId, playerName, updateMyPresence]);

  const isHost = String(self?.connectionId) === hostId || (!hostId && others.length === 0);
  const currentConnId = String(self?.connectionId);
  const isLocked = lockedList.includes(currentConnId);
  const totalPlayers = others.length + 1;
  const maxPlayers = settings?.maxPlayers || 4;

  // 滿員阻斷檢測
  if (totalPlayers > maxPlayers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md border-red-500/40">
          <h2 className="text-2xl font-bold text-red-400 mb-2">房間人數已滿</h2>
          <p className="text-sm text-gray-300 mb-6">
            此心靈房間已達人數上限 ({maxPlayers} 人)，請選擇其他 Emoji 暗號房間。
          </p>
          <Button variant="gold" onClick={() => router.push("/")}>
            返回大廳
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-3 md:p-6 max-w-5xl mx-auto flex flex-col justify-between">
      {/* 頂部導覽 */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-1 text-xs">
          <ArrowLeft className="w-4 h-4" /> 離開房間
        </Button>

        <h1 className="text-xl md:text-2xl font-black text-poker-accent tracking-wide">
          心靈牌桌
        </h1>

        <div className="w-20 text-right">
          <span className="text-[11px] bg-emerald-950/60 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
            即時連線中
          </span>
        </div>
      </div>

      {/* 狀態列 */}
      <GameStatus
        roomId={roomId}
        lives={lives ?? 3}
        shurikens={shurikens ?? 1}
        currentLevel={currentLevel ?? 1}
        connectedCount={totalPlayers}
        maxPlayers={maxPlayers}
        onUseShuriken={useShuriken}
        canUseShuriken={(shurikens ?? 0) > 0 && status === "playing"}
      />

      {/* 玩家列表 */}
      <PlayerList
        currentConnectionId={currentConnId}
        hostId={hostId}
        lockedList={lockedList}
        others={others}
        selfPresence={self?.presence}
      />

      {/* 中央賭桌盤面 */}
      <GameBoard
        board={board}
        currentConnectionId={currentConnId}
        status={status || "waiting"}
        onRecallCard={recallCard}
        onFlipCard={(slotId) => flipCard(slotId)}
      />

      {/* 鎖定按鈕 */}
      {status === "playing" && (
        <LockButton
          isLocked={isLocked}
          lockedCount={lockedList.length}
          totalPlayers={totalPlayers}
          onToggleLock={() => toggleLock(playerName)}
        />
      )}

      {/* 玩家手牌區 */}
      {status === "playing" && (
        <PlayerHand
          hand={myHand}
          playerName={playerName}
          onPlayCard={(val) => placeCard(val, playerName)}
        />
      )}

      {/* 房主控制面板 */}
      <HostPanel
        isHost={isHost}
        status={status || "waiting"}
        settings={settings}
        onDealCards={dealCards}
        onFlipAll={() => flipCard()}
        onResetGame={resetGame}
        onUpdateSettings={updateSettings}
      />

      {/* 勝負結果彈窗 */}
      <ResultOverlay result={result || null} onRestart={resetGame} />
    </main>
  );
}

export default function RoomPage() {
  const roomId = useRoomId();

  if (!roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-poker-bg text-poker-accent">
        載入中...
      </div>
    );
  }

  return (
    <LiveblocksWrapper roomId={roomId}>
      <RoomInner />
    </LiveblocksWrapper>
  );
}
