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
  const [isHostModalOpen, setIsHostModalOpen] = React.useState<boolean>(false);

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
    claimHost,
    autoResetStaleRoom,
  } = useGameState();

  // 更新 Presence 與維護房主身分，並自動清除殘留無人的舊房間
  useEffect(() => {
    try {
      if (playerId && playerName) {
        updateMyPresence({
          playerId,
          playerName,
          isReady: false,
        });
      }
      claimHost();
      autoResetStaleRoom();
    } catch (error) {
      console.error("更新玩家 Presence 失敗:", error);
    }
    return () => {};
  }, [playerId, playerName, updateMyPresence, claimHost, autoResetStaleRoom, others]);

  const isHost = Boolean(self?.connectionId && String(self.connectionId) === hostId);
  const currentConnId = String(self?.connectionId);
  const isLocked = lockedList.includes(currentConnId);
  const totalPlayers = others.length + 1;
  const maxPlayers = settings?.maxPlayers || 4;

  // 滿員阻斷檢測
  if (totalPlayers > maxPlayers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md border-ukiyo-vermillion/40">
          <h2 className="text-2xl font-serif font-bold text-ukiyo-vermillion mb-2">房間人數已滿</h2>
          <p className="text-xs md:text-sm text-ukiyo-mist mb-6 font-serif">
            此心靈席位已達上限 ({maxPlayers} 人)，請選擇其他 Emoji 暗號房間。
          </p>
          <Button variant="primary" onClick={() => router.push("/")}>
            返回大廳
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-2.5 md:p-5 max-w-4xl mx-auto flex flex-col justify-between">
      {/* 頂部極簡單行 Header */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-1 text-xs font-serif">
          <ArrowLeft className="w-3.5 h-3.5" /> 離開席位
        </Button>

        <h1 className="text-lg md:text-xl font-serif font-black text-ukiyo-foam tracking-widest">
          心靈牌席
        </h1>

        <div className="w-16 text-right">
          <span className="text-[10px] bg-ukiyo-surface/80 text-ukiyo-gold px-2 py-0.5 rounded border border-ukiyo-foam/10 font-mono">
            LIVE
          </span>
        </div>
      </div>

      {/* 頂部狀態與房間資訊列 (包含房主 ⚙ 按鈕) */}
      <GameStatus
        roomId={roomId}
        lives={lives ?? 3}
        shurikens={shurikens ?? 1}
        currentLevel={currentLevel ?? 1}
        connectedCount={totalPlayers}
        maxPlayers={maxPlayers}
        isHost={isHost}
        onOpenHostPanel={() => setIsHostModalOpen(true)}
        onUseShuriken={useShuriken}
        canUseShuriken={(shurikens ?? 0) > 0 && status === "playing"}
      />

      {/* 線上玩家清單 (極簡標籤) */}
      <PlayerList
        currentConnectionId={currentConnId}
        hostId={hostId}
        lockedList={lockedList}
        others={others}
        selfPresence={self?.presence}
      />

      {/* 中央極簡禪意盤面 */}
      <GameBoard
        board={board}
        currentConnectionId={currentConnId}
        status={status || "waiting"}
        onRecallCard={recallCard}
        onFlipCard={(slotId) => flipCard(slotId)}
      />

      {/* 底部玩家手牌與鎖定按鈕 */}
      {status === "playing" && (
        <PlayerHand
          hand={myHand}
          playerName={playerName}
          onPlayCard={(val) => placeCard(val, playerName)}
          isLocked={isLocked}
          lockedCount={lockedList.length}
          totalPlayers={totalPlayers}
          onToggleLock={() => toggleLock(playerName)}
        />
      )}

      {/* 大廳等待提示與房主開局按鈕 (當 status === "waiting") */}
      {status === "waiting" && (
        <div className="w-full glass-panel rounded-2xl p-4 my-2 text-center flex flex-col items-center">
          <p className="text-xs text-ukiyo-mist font-serif mb-3">
            {isHost
              ? "全員入座後，請點擊下按鈕開始遊戲。"
              : "靜候房主開始牌局..."}
          </p>
          {isHost && (
            <Button variant="primary" size="lg" onClick={dealCards} className="font-serif tracking-widest">
              發牌啟局
            </Button>
          )}
        </div>
      )}

      {/* 房主 Modal 控制彈窗 */}
      <HostPanel
        isHost={isHost}
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        status={status || "waiting"}
        settings={settings}
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
      <div className="flex items-center justify-center min-h-screen bg-ukiyo-bg text-ukiyo-gold font-serif">
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
