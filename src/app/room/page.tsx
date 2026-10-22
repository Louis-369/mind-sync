"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { useStatus } from "@liveblocks/react";
import { useRoomId } from "../../hooks/useRoomId";
import { usePlayerId } from "../../hooks/usePlayerId";
import { useGameState } from "../../hooks/useGameState";
import { useIdleDisconnect } from "../../hooks/useIdleDisconnect";
import { LiveblocksWrapper } from "../../components/providers/LiveblocksWrapper";
import { GameStatus } from "../../components/game/GameStatus";
import { PlayerList } from "../../components/game/PlayerList";
import { GameBoard } from "../../components/game/GameBoard";
import { PlayerHand } from "../../components/game/PlayerHand";
import { HostPanel } from "../../components/game/HostPanel";
import { ResultOverlay } from "../../components/game/ResultOverlay";
import { Button } from "../../components/ui/Button";
import { CalligraphyMatrix } from "../../components/ui/CalligraphyMatrix";
import { TOPIC_DECK, DEFAULT_TOPIC } from "../../lib/constants";

function RoomInner() {
  const router = useRouter();
  const roomId = useRoomId();
  const connectionStatus = useStatus();
  const { playerId, playerName, setPlayerName } = usePlayerId();
  const [isHostModalOpen, setIsHostModalOpen] = React.useState<boolean>(false);
  const [inputNameTemp, setInputNameTemp] = React.useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 5 分鐘閒置與 30 秒預警機制 (既省 20人 CCU 額度，又保證遊戲體驗)
  const { isWarning, isIdle, remainingSeconds, resetTimer } = useIdleDisconnect(
    4.5 * 60 * 1000,
    5 * 60 * 1000
  );

  const {
    settings,
    topic,
    board,
    lockedList,
    status,
    result,
    hostId,
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
    flipAllCards,
    updateSettings,
    changeTopic,
    setFocusedSlot,
    sendReaction,
    resetGame,
    claimHost,
    autoResetStaleRoom,
    syncOfflinePlayers,
    playerJoinOrder,
    getActivePlayerIds,
  } = useGameState(roomId);

  // 1. 收集線上所有真實獨立玩家 UUID
  const uniquePlayerIds = new Set<string>();
  if (playerId) uniquePlayerIds.add(playerId);
  others.forEach((o) => {
    const pId = o.presence?.playerId;
    if (pId) {
      uniquePlayerIds.add(pId);
    }
  });

  const totalUniqueOnlineCount = uniquePlayerIds.size;
  const totalPlayers = totalUniqueOnlineCount;
  const maxPlayers = settings?.maxPlayers || 4;

  // 2. 建立線上純淨順位
  const onlineOrder = (playerJoinOrder || []).filter((id) => uniquePlayerIds.has(id));
  if (playerId && !onlineOrder.includes(playerId)) {
    onlineOrder.push(playerId);
  }

  // 3. 計算自己在當前線上活躍人數中的排名
  const myOnlineRank = playerId ? onlineOrder.indexOf(playerId) : -1;

  // 4. 滿員過載嚴密防護 (isOverflow)
  const isOverflow =
    myOnlineRank !== -1
      ? myOnlineRank >= maxPlayers && totalUniqueOnlineCount > maxPlayers
      : totalUniqueOnlineCount > maxPlayers;

  // 處理卡牌放置事件
  const handlePlayCard = (cardValue: number) => {
    placeCard(cardValue, playerName, selectedSlotId || undefined, playerId);
    setSelectedSlotId(null);
    setFocusedSlot(null);
  };

  const handleSelectSlot = (slotId: string) => {
    const nextSlot = selectedSlotId === slotId ? null : slotId;
    setSelectedSlotId(nextSlot);
    setFocusedSlot(nextSlot);
  };

  const handleRandomTopic = () => {
    const currentId = topic?.id;
    const candidates = TOPIC_DECK.filter((t) => t.id !== currentId);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || DEFAULT_TOPIC;
    changeTopic(chosen);
  };

  // 整理隊友目光所在席位 (Presence Juice)
  const presenceSlotsMap: Record<string, string[]> = {};
  if (selectedSlotId) {
    presenceSlotsMap[selectedSlotId] = ["你"];
  }
  others.forEach((o) => {
    const slot = o.presence?.focusedSlotId;
    const name = o.presence?.playerName || "同伴";
    if (slot) {
      if (!presenceSlotsMap[slot]) presenceSlotsMap[slot] = [];
      if (!presenceSlotsMap[slot].includes(name)) presenceSlotsMap[slot].push(name);
    }
  });

  // 監聽離頁/重新整理事件
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "playing" || status === "locked") {
        e.preventDefault();
        e.returnValue = "你即將離開或重新整理網頁，這將影響當前遊戲局數與其他玩家！";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [status]);

  // 監聽手機端視窗切換與 Liveblocks 重連狀態
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        try {
          if (playerId && playerName) {
            updateMyPresence({
              playerId,
              playerName,
              isReady: false,
            });
          }
          claimHost(playerId);
          syncOfflinePlayers(playerId);
        } catch (error) {
          console.error("視窗恢復前景時狀態喚醒失敗:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [playerId, playerName, updateMyPresence, claimHost, syncOfflinePlayers]);

  // 當 WebSocket 連線恢復為 connected 時自動刷新身分與狀態
  useEffect(() => {
    if (connectionStatus === "connected") {
      try {
        if (playerId && playerName) {
          updateMyPresence({
            playerId,
            playerName,
            isReady: false,
          });
        }
        claimHost(playerId);
        syncOfflinePlayers(playerId);
      } catch (error) {
        console.error("連線恢復時狀態校準失敗:", error);
      }
    }
  }, [connectionStatus, playerId, playerName, updateMyPresence, claimHost, syncOfflinePlayers]);

  // 更新 Presence 與維護房主身分
  useEffect(() => {
    try {
      if (isOverflow || isIdle) return;

      if (playerId && playerName) {
        const isDuplicateName = others.some(
          (o) => o.presence?.playerId !== playerId && o.presence?.playerName === playerName
        );
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
      claimHost(playerId);
      syncOfflinePlayers(playerId);
    } catch (error) {
      console.error("更新玩家 Presence 失敗:", error);
    }
    return () => {};
  }, [playerId, playerName, updateMyPresence, claimHost, syncOfflinePlayers, others, isOverflow, isIdle]);

  const currentConnId = String(self?.connectionId);

  // 嚴密單一房主判定：唯有自己的 ID / 連線 ID 與 Liveblocks 唯一 hostId 匹配時才為房主
  const isHost = Boolean(
    (playerId && hostId === playerId) ||
    (self?.connectionId && String(self.connectionId) === hostId) ||
    (!hostId && myOnlineRank === 0)
  );

  const isLocked = lockedList.includes(currentConnId) || (playerId ? lockedList.includes(playerId) : false);

  // 1. 暱稱未填寫阻斷 (分享連結直連進房時之暱稱輸入視窗)
  if (!playerName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-ukiyo-foam/20 flex flex-col items-center space-y-4 shadow-2xl relative z-30">
          <h2 className="text-xl font-serif font-bold text-ukiyo-gold">請輸入稱號</h2>
          <p className="text-xs text-ukiyo-mist font-serif leading-relaxed">
            您正透過分享連結入座暗號房間 <span className="text-ukiyo-foam font-mono font-bold">{roomId}</span>
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
            className="w-full font-serif font-bold tracking-widest"
          >
            入座牌席
          </Button>
        </div>
      </div>
    );
  }

  // 2. 滿員阻斷檢測
  if (isOverflow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="glass-panel p-8 rounded-3xl max-w-md border border-ukiyo-vermillion/40 shadow-2xl relative z-30">
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

  // 3. 閒置斷線提示彈窗
  if (isIdle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-ukiyo-bg/95">
        <div className="glass-panel p-8 rounded-3xl max-w-md border border-ukiyo-gold/40 flex flex-col items-center space-y-4 shadow-2xl relative z-30">
          <div className="w-14 h-14 rounded-full bg-ukiyo-gold/20 border border-ukiyo-gold/40 flex items-center justify-center text-ukiyo-gold">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-ukiyo-foam">連線已暫停</h2>
          <p className="text-xs md:text-sm text-ukiyo-mist font-serif leading-relaxed">
            您已閒置超過 5 分鐘。為節省連線席位資源，系統已暫停連線。
          </p>
          <Button
            variant="primary"
            onClick={() => {
              resetTimer();
              window.location.reload();
            }}
            className="gap-2 font-serif tracking-widest mt-2"
          >
            <RefreshCw className="w-4 h-4" /> 重新連線入座
          </Button>
        </div>
      </div>
    );
  }

  // 30 秒閒置預警浮動提示列 (使用 createPortal 與 z-[250]，徹底隔離父層 Stacking Context)
  const warningBannerJSX = mounted && isWarning ? (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[250] w-[92%] max-w-md glass-panel border border-ukiyo-gold/60 p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-ukiyo-gold shrink-0" />
        <div className="text-left">
          <h4 className="text-xs font-serif font-bold text-ukiyo-gold">閒置提示</h4>
          <p className="text-[11px] font-serif text-ukiyo-foam">
            即將暫停連線 (剩餘 <span className="font-mono text-ukiyo-gold font-bold text-sm">{remainingSeconds}</span> 秒)
          </p>
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={resetTimer} className="font-serif text-xs px-3">
        繼續遊玩
      </Button>
    </div>
  ) : null;

  return (
    <main className="w-full max-w-4xl mx-auto flex flex-col justify-between min-h-[100dvh] relative py-1.5 px-2 sm:px-4">
      {/* 偷師 ascii-magic 之背景和風字符水波流動 */}
      <CalligraphyMatrix />

      {mounted && warningBannerJSX && createPortal(warningBannerJSX, document.body)}

      {/* 鎖定階段聚光暗角特效層 */}
      {status === "locked" && <div className="stage-vignette-locked" />}

      {/* 頂部全合一緊湊 HUD */}
      <GameStatus
        roomId={roomId}
        connectedCount={totalPlayers}
        maxPlayers={maxPlayers}
        playerName={playerName}
        isHost={isHost}
        onOpenHostPanel={() => setIsHostModalOpen(true)}
        onChangePlayerName={setPlayerName}
        onLeaveRoom={() => router.push("/")}
      />

      {/* 線上同席玩家徽章與心情氣泡列 */}
      <PlayerList
        currentConnectionId={currentConnId}
        currentPlayerId={playerId}
        hostId={hostId}
        lockedList={lockedList}
        others={others}
        selfPresence={self?.presence}
        onSendReaction={sendReaction}
      />

      {/* 中央主舞台：價值主題卷軸 + 牌席 */}
      <GameBoard
        board={board}
        currentConnectionId={currentConnId}
        currentPlayerId={playerId}
        status={status || "waiting"}
        totalPlayers={totalPlayers}
        cardsPerPlayer={settings?.cardsPerPlayer || 2}
        lockedList={lockedList}
        selectedSlotId={selectedSlotId}
        topic={topic}
        presenceSlotsMap={presenceSlotsMap}
        isHost={isHost}
        activePlayerIds={getActivePlayerIds()}
        onRestart={resetGame}
        onRandomTopic={handleRandomTopic}
        onSelectSlot={handleSelectSlot}
        onRecallCard={(targetKey) => recallCard(targetKey, playerId)}
        onFlipCard={(targetKey) => flipCard(targetKey, playerId)}
      />

      {/* 底部玩家扇形手牌與朱印鎖定按鈕 */}
      {status === "playing" && (
        <PlayerHand
          hand={myHand}
          playerName={playerName}
          onPlayCard={handlePlayCard}
          isLocked={isLocked}
          lockedCount={lockedList.filter((id) => uniquePlayerIds.has(id)).length}
          totalPlayers={totalPlayers}
          hasBoardCollision={hasBoardCollision}
          onToggleLock={() => toggleLock(playerName, playerId)}
        />
      )}

      {/* 揭牌階段底部指揮列 (防死鎖與信心出發) */}
      {status === "locked" && (
        <div className="w-full glass-panel rounded-2xl p-3 my-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-fade-in shadow-xl border border-ukiyo-gold/40">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-serif">
            <span className="w-2.5 h-2.5 rounded-full bg-ukiyo-gold animate-ping" />
            <span className="text-ukiyo-gold font-bold">
              揭牌階段 ({board.filter((c) => c.flipped).length} / {board.length} 席已揭曉)
            </span>
            <span className="text-ukiyo-mist hidden md:inline text-xs">
              — 請從全場最有信心的席位點擊揭牌！
            </span>
          </div>

          {isHost && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => flipAllCards(playerId)}
              className="text-xs font-serif text-ukiyo-gold border-ukiyo-gold/40 hover:bg-ukiyo-gold/15 whitespace-nowrap"
            >
              房主一鍵全揭
            </Button>
          )}
        </div>
      )}

      {/* 大廳等待提示與房主開局按鈕 */}
      {status === "waiting" && (
        <div className="w-full glass-panel rounded-2xl p-4 my-2 text-center flex flex-col items-center">
          <p className="text-xs text-ukiyo-mist font-serif mb-3">
            {isHost
              ? totalPlayers >= 2
                ? "全員入座後，請點擊下方按鈕開始發牌。"
                : "靜候至少 2 位玩家入座方可開局..."
              : "靜候房主開始牌局..."}
          </p>
          {isHost && (
            <Button
              variant="primary"
              size="lg"
              disabled={totalPlayers < 2}
              onClick={() => {
                if (totalPlayers >= 2) dealCards(playerId);
              }}
              className={`font-serif tracking-widest ${
                totalPlayers < 2 ? "opacity-50 cursor-not-allowed border-ukiyo-foam/20" : ""
              }`}
            >
              {totalPlayers < 2 ? "等待玩家入座 (至少 2 人)" : "發牌開局"}
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

      {/* 勝負結果彈窗 (附帶心靈同步率與戰犯分析) */}
      <ResultOverlay
        result={result || null}
        isHost={isHost}
        onRestart={resetGame}
        board={board}
        topic={topic}
      />
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
