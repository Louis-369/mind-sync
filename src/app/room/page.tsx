"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
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

  // 5 分鐘閒置與 30 秒預警機制
  const { isWarning, isIdle, remainingSeconds, resetTimer } = useIdleDisconnect(
    4.5 * 60 * 1000,
    5 * 60 * 1000
  );

  const {
    isStorageLoaded,
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

  // 整理隊友目光所在席位
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
          if (isStorageLoaded) {
            claimHost(playerId);
            syncOfflinePlayers(playerId);
          }
        } catch (error) {
          console.error("視窗恢復前景時狀態喚醒失敗:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [playerId, playerName, isStorageLoaded, updateMyPresence, claimHost, syncOfflinePlayers]);

  // 當 WebSocket 連線恢復為 connected 且 Storage 載入完成時自動刷新身分與狀態
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
        if (isStorageLoaded) {
          claimHost(playerId);
          syncOfflinePlayers(playerId);
        }
      } catch (error) {
        console.error("連線恢復時狀態校準失敗:", error);
      }
    }
  }, [connectionStatus, isStorageLoaded, playerId, playerName, updateMyPresence, claimHost, syncOfflinePlayers]);

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
      if (isStorageLoaded) {
        claimHost(playerId);
        syncOfflinePlayers(playerId);
      }
    } catch (error) {
      console.error("更新玩家 Presence 失敗:", error);
    }
    return () => {};
  }, [playerId, playerName, isStorageLoaded, updateMyPresence, claimHost, syncOfflinePlayers, others, isOverflow, isIdle]);

  const currentConnId = String(self?.connectionId);

  const isHost = Boolean(
    (playerId && hostId === playerId) ||
    (self?.connectionId && String(self.connectionId) === hostId) ||
    (!hostId && myOnlineRank === 0)
  );

  const isLocked = lockedList.includes(currentConnId) || (playerId ? lockedList.includes(playerId) : false);

  // 1. 暱稱未填寫阻斷 (分享連結直連進房時之暱稱輸入視窗)
  if (!playerName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#090b0e]">
        <AsciiWaveCanvas active={true} />
        <div className="bg-[#12161f] p-6 max-w-sm w-full border border-slate-700 rounded-2xl flex flex-col items-center space-y-4 shadow-2xl relative z-30">
          <h2 className="text-lg font-bold text-white">歡迎進入茶室</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            透過邀請連結進入房間 <span className="font-bold text-[#f59e0b]">{roomId}</span>，請先輸入您的稱號：
          </p>
          <input
            type="text"
            value={inputNameTemp}
            onChange={(e) => setInputNameTemp(e.target.value)}
            placeholder="例如：風之浪人"
            maxLength={14}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-center text-sm text-white focus:outline-none focus:border-[#f59e0b]"
          />
          <Button
            variant="primary"
            size="md"
            disabled={!inputNameTemp.trim()}
            onClick={() => setPlayerName(inputNameTemp.trim())}
            className="w-full font-bold"
          >
            確認入座
          </Button>
        </div>
      </div>
    );
  }

  // 2. 滿員阻斷檢測
  if (isOverflow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#090b0e]">
        <AsciiWaveCanvas active={true} />
        <div className="bg-[#12161f] p-6 max-w-md border border-red-500/50 rounded-2xl shadow-2xl relative z-30">
          <h2 className="text-lg font-bold text-red-400 mb-2">房間席位已滿</h2>
          <p className="text-xs text-slate-300 mb-4">
            此房間已達人數上限 ({maxPlayers} 人)，請返回大廳選擇其他房間暗號。
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#090b0e]">
        <AsciiWaveCanvas active={true} />
        <div className="bg-[#12161f] p-6 max-w-md border border-[#f59e0b]/50 rounded-2xl flex flex-col items-center space-y-3 shadow-2xl relative z-30">
          <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-[#f59e0b] flex items-center justify-center text-[#f59e0b]">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#f59e0b]">閒置連線已暫停</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            您已超過 5 分鐘未操作，系統已自動釋放連線名額。點擊下方按鈕即可立即重連！
          </p>
          <Button
            variant="primary"
            onClick={() => {
              resetTimer();
              window.location.reload();
            }}
            className="gap-2 font-bold mt-2"
          >
            <RefreshCw className="w-4 h-4 text-black" /> 重新進入房間
          </Button>
        </div>
      </div>
    );
  }

  // 30 秒閒置預警浮動提示列
  const warningBannerJSX = mounted && isWarning ? (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[250] w-[92%] max-w-md bg-[#12161f] border border-[#f59e0b] rounded-xl p-3 shadow-2xl flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-[#f59e0b] shrink-0" />
        <div className="text-left">
          <h4 className="text-xs font-bold text-[#f59e0b]">即將自動離席</h4>
          <p className="text-[11px] text-slate-300">
            閒置倒數 <span className="font-bold text-sm text-[#f59e0b]">{remainingSeconds}</span> 秒
          </p>
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={resetTimer} className="text-xs px-3">
        繼續遊玩
      </Button>
    </div>
  ) : null;

  return (
    <main className="w-full max-w-4xl mx-auto flex flex-col justify-between min-h-[100dvh] relative py-1 px-2 sm:px-4">
      {/* 互動 ASCII 字符海浪畫布 */}
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

      {/* 底部玩家扇形手牌與鎖定按鈕 */}
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
        <div className="w-full bg-[#12161f] p-3 my-1.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 border border-[#f59e0b] shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-white font-bold">
              翻牌階段（已翻開 {board.filter((c) => c.flipped).length} / {board.length} 張）
            </span>
            <span className="text-slate-300 hidden md:inline text-xs">
              — 請點擊最有把握的卡牌翻開驗證！
            </span>
          </div>

          {isHost && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => flipAllCards(playerId)}
              className="text-xs whitespace-nowrap"
            >
              房主一鍵全揭
            </Button>
          )}
        </div>
      )}

      {/* 大廳等待提示與房主開局按鈕 */}
      {(!status || status === "waiting") && (
        <div className="w-full bg-[#12161f] p-3.5 my-1.5 rounded-xl text-center flex flex-col items-center border border-slate-700 shadow-lg">
          <p className="text-xs text-slate-300 mb-2.5">
            {!isStorageLoaded
              ? "正在連線同步房間狀態..."
              : isHost
              ? totalPlayers >= 2
                ? "全員已就緒！點擊下方按鈕即可發牌開局。"
                : "等待至少 2 位玩家加入房間即可開局（可開新分頁測試）..."
              : "等待房主開始發牌..."}
          </p>
          {isHost && (
            <Button
              variant="primary"
              size="lg"
              disabled={!isStorageLoaded || totalPlayers < 2}
              onClick={() => {
                if (isStorageLoaded && totalPlayers >= 2) dealCards(playerId);
              }}
              className={`font-bold tracking-wider ${
                !isStorageLoaded || totalPlayers < 2 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="flex items-center gap-1.5 text-black">
                <Sparkles className="w-4 h-4 text-black" />
                {totalPlayers < 2 ? "等待同伴入座 (至少 2 人)" : "發牌開局"}
              </span>
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
      <div className="flex items-center justify-center min-h-screen bg-[#090b0e] text-white text-sm">
        正在載入房間資訊...
      </div>
    );
  }

  return (
    <LiveblocksWrapper roomId={roomId}>
      <RoomInner />
    </LiveblocksWrapper>
  );
}
