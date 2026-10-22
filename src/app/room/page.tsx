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
import { AsciiWaveCanvas } from "../../components/ui/AsciiWaveCanvas";
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center font-mono">
        <div className="bg-[#030609] p-6 max-w-sm w-full border-2 border-[#00ff9d] flex flex-col items-center space-y-4 shadow-[0_0_25px_rgba(0,255,157,0.3)] relative z-30">
          <h2 className="text-base font-bold text-[#00ff9d]">&gt; SYS://SET_OPERATOR_ID</h2>
          <p className="text-xs text-[#00e5ff] leading-relaxed">
            透過分享連結存取加密頻道 <span className="font-bold text-[#00ff9d]">{roomId}</span>
          </p>
          <input
            type="text"
            value={inputNameTemp}
            onChange={(e) => setInputNameTemp(e.target.value)}
            placeholder="OPERATOR_NAME..."
            maxLength={14}
            className="w-full bg-[#020406] border-2 border-[#00ff9d] px-3 py-2 text-center text-sm font-mono text-[#00ff9d] focus:outline-none focus:shadow-[0_0_12px_#00ff9d]"
          />
          <Button
            variant="primary"
            size="md"
            disabled={!inputNameTemp.trim()}
            onClick={() => setPlayerName(inputNameTemp.trim())}
            className="w-full font-mono font-bold tracking-widest"
          >
            [JOIN_CHANNEL // 存取席位]
          </Button>
        </div>
      </div>
    );
  }

  // 2. 滿員阻斷檢測
  if (isOverflow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center font-mono">
        <div className="bg-[#030609] p-6 max-w-md border-2 border-[#ff0055] shadow-[0_0_25px_#ff0055] relative z-30">
          <h2 className="text-base font-bold text-[#ff0055] mb-2">&gt; SYS://CHANNEL_FULL_ERR</h2>
          <p className="text-xs text-[#00ff9d]/70 mb-4">
            此加密頻道已達節點上限 ({maxPlayers} 人)，請選擇或建立其他通訊頻道。
          </p>
          <Button variant="primary" onClick={() => router.push("/")}>
            [RETURN_TO_LOBBY]
          </Button>
        </div>
      </div>
    );
  }

  // 3. 閒置斷線提示彈窗
  if (isIdle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black/95 font-mono">
        <div className="bg-[#030609] p-6 max-w-md border-2 border-[#ffb000] flex flex-col items-center space-y-3 shadow-[0_0_20px_#ffb000] relative z-30">
          <div className="w-12 h-12 border border-[#ffb000] flex items-center justify-center text-[#ffb000]">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#ffb000]">&gt; SYS://CONNECTION_TIMEOUT</h2>
          <p className="text-xs text-[#00ff9d]/70 leading-relaxed">
            特工閒置逾時超過 5 分鐘。為釋放節點頻寬資源，已自動暫停頻道連線。
          </p>
          <Button
            variant="primary"
            onClick={() => {
              resetTimer();
              window.location.reload();
            }}
            className="gap-2 font-mono font-bold mt-2"
          >
            <RefreshCw className="w-4 h-4 text-black" /> [RECONNECT_CHANNEL]
          </Button>
        </div>
      </div>
    );
  }

  // 30 秒閒置預警浮動提示列
  const warningBannerJSX = mounted && isWarning ? (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[250] w-[92%] max-w-md bg-[#030609] border-2 border-[#ffb000] p-3 shadow-[0_0_20px_#ffb000] flex items-center justify-between animate-fade-in font-mono">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-[#ffb000] shrink-0" />
        <div className="text-left">
          <h4 className="text-xs font-bold text-[#ffb000]">&gt; SYS://IDLE_WARN</h4>
          <p className="text-[11px] text-[#00ff9d]">
            即將中斷連線 (剩餘 <span className="font-bold text-sm text-[#ffb000]">{remainingSeconds}</span> 秒)
          </p>
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={resetTimer} className="font-mono text-xs px-3">
        [CONTINUE]
      </Button>
    </div>
  ) : null;

  return (
    <main className="w-full max-w-4xl mx-auto flex flex-col justify-between min-h-[100dvh] relative py-1 px-2 sm:px-4 font-mono">
      {/* 60fps 賽博矩陣 ASCII 字符海浪畫布 */}
      <AsciiWaveCanvas active={true} />

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
        showTopicSetting={settings?.showTopic !== false}
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

      {/* 揭牌階段底部指揮列 */}
      {status === "locked" && (
        <div className="w-full bg-[#04080e] p-2.5 my-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 border-2 border-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.3)] font-mono animate-fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-[#00ff9d] animate-ping" />
            <span className="text-[#00ff9d] font-bold">
              SYS://DECRYPTION_PHASE ({board.filter((c) => c.flipped).length} / {board.length} NODES DECRYPTED)
            </span>
            <span className="text-[#00e5ff] hidden md:inline text-[10px]">
              &gt; 點擊全場最有把握之節點進行解密
            </span>
          </div>

          {isHost && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => flipAllCards(playerId)}
              className="text-xs whitespace-nowrap"
            >
              [ROOT: DECRYPT_ALL // 一鍵全揭]
            </Button>
          )}
        </div>
      )}

      {/* 大廳等待提示與房主開局按鈕 */}
      {status === "waiting" && (
        <div className="w-full bg-[#030609]/95 p-3.5 my-1.5 text-center flex flex-col items-center border border-[#00ff9d]/40 font-mono">
          <p className="text-xs text-[#00ff9d]/70 mb-2.5">
            {isHost
              ? totalPlayers >= 2
                ? "&gt; 全節點連線已建立，點擊下方執行發牌開局。"
                : "&gt; 等待至少 2 個節點加入通訊頻道..."
              : "&gt; 等待 ROOT 權限特工執行發牌開局..."}
          </p>
          {isHost && (
            <Button
              variant="primary"
              size="lg"
              disabled={totalPlayers < 2}
              onClick={() => {
                if (totalPlayers >= 2) dealCards(playerId);
              }}
              className={`font-mono font-bold tracking-widest ${
                totalPlayers < 2 ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              {totalPlayers < 2 ? "[WAITING_FOR_PEERS: MIN 2]" : "[DISPATCH_PACKETS // 發牌開局]"}
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
      <div className="flex items-center justify-center min-h-screen bg-[#030609] text-[#00ff9d] font-mono text-sm">
        &gt; SYS://ESTABLISHING_NEURAL_LINK...
      </div>
    );
  }

  return (
    <LiveblocksWrapper roomId={roomId}>
      <RoomInner />
    </LiveblocksWrapper>
  );
}
