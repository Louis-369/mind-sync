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
  const { playerId, playerName, setPlayerName } = usePlayerId();
  const [isHostModalOpen, setIsHostModalOpen] = React.useState<boolean>(false);
  const [inputNameTemp, setInputNameTemp] = React.useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(null);

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
    hasBoardCollision,
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

  const totalPlayers = others.length + 1;
  const maxPlayers = settings?.maxPlayers || 4;
  const isOverflow = totalPlayers > maxPlayers;

  // 處理卡牌放置事件 (若有選擇特定槽位則放入該槽位，否則自動遞補)
  const handlePlayCard = (cardValue: number) => {
    placeCard(cardValue, playerName, selectedSlotId || undefined);
    setSelectedSlotId(null);
  };

  // 更新 Presence 與維護房主身分，並自動清除殘留無人的舊房間 (唯有未滿員時才執行，防止擠退已有玩家)
  useEffect(() => {
    try {
      if (isOverflow) return; // 滿員阻斷，不發送 Presence 避免干擾房內玩家

      if (playerId && playerName) {
        // 檢查是否撞名
        const isDuplicateName = others.some((o) => o.presence?.playerName === playerName);
        let finalName = playerName;
        if (isDuplicateName) {
          finalName = `${playerName} #2`;
        }

        updateMyPresence({
          playerId,
          playerName: finalName,
          isReady: false,
        });
      }
      claimHost();
      autoResetStaleRoom();
    } catch (error) {
      console.error("更新玩家 Presence 失敗:", error);
    }
    return () => {};
  }, [playerId, playerName, updateMyPresence, claimHost, autoResetStaleRoom, others, isOverflow]);

  const isHost = Boolean(self?.connectionId && String(self.connectionId) === hostId);
  const currentConnId = String(self?.connectionId);
  const isLocked = lockedList.includes(currentConnId);

  // 1. 暱稱未填寫阻斷 (靠複製網址直連近來)
  if (!playerName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-ukiyo-foam/20 flex flex-col items-center space-y-4">
          <h2 className="text-xl font-serif font-bold text-ukiyo-gold">請輸入心靈稱號</h2>
          <p className="text-xs text-ukiyo-mist font-serif">
            你正在進入暗號房間 <span className="text-ukiyo-foam font-mono font-bold">{roomId}</span>
          </p>
          <input
            type="text"
            value={inputNameTemp}
            onChange={(e) => setInputNameTemp(e.target.value)}
            placeholder="請輸入暱稱..."
            maxLength={12}
            className="w-full bg-ukiyo-bg border border-ukiyo-foam/20 rounded-xl px-4 py-2.5 text-center text-sm font-serif text-ukiyo-foam focus:outline-none focus:border-ukiyo-gold"
          />
          <Button
            variant="primary"
            size="md"
            disabled={!inputNameTemp.trim()}
            onClick={() => setPlayerName(inputNameTemp.trim())}
            className="w-full font-serif"
          >
            入座牌席
          </Button>
        </div>
      </div>
    );
  }

  // 2. 滿員阻斷檢測 (防擠退)
  if (isOverflow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md border border-ukiyo-vermillion/40">
          <h2 className="text-2xl font-serif font-bold text-ukiyo-vermillion mb-2">席位已滿</h2>
          <p className="text-xs md:text-sm text-ukiyo-mist mb-6 font-serif">
            此暗號房間已達人數上限 ({maxPlayers} 人)，為維護牌席秩序，請選擇其他暗號房間。
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

      {/* 中央極簡禪意盤面 (傳入容量與鎖定清單) */}
      <GameBoard
        board={board}
        currentConnectionId={currentConnId}
        status={status || "waiting"}
        totalPlayers={totalPlayers}
        cardsPerPlayer={settings?.cardsPerPlayer || 2}
        lockedList={lockedList}
        selectedSlotId={selectedSlotId}
        onSelectSlot={(slotId) => setSelectedSlotId((prev) => (prev === slotId ? null : slotId))}
        onRecallCard={recallCard}
        onFlipCard={(slotId) => flipCard(slotId)}
      />

      {/* 底部玩家手牌與鎖定按鈕 */}
      {status === "playing" && (
        <PlayerHand
          hand={myHand}
          playerName={playerName}
          onPlayCard={handlePlayCard}
          isLocked={isLocked}
          lockedCount={lockedList.length}
          totalPlayers={totalPlayers}
          hasBoardCollision={hasBoardCollision}
          onToggleLock={() => toggleLock(playerName)}
        />
      )}

      {/* 大廳等待提示與房主開局按鈕 (當 status === "waiting") */}
      {status === "waiting" && (
        <div className="w-full glass-panel rounded-2xl p-4 my-2 text-center flex flex-col items-center">
          <p className="text-xs text-ukiyo-mist font-serif mb-3">
            {isHost
              ? "全員入座後，請點擊下方按鈕開始發牌。"
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
      <ResultOverlay result={result || null} isHost={isHost} onRestart={resetGame} />
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
