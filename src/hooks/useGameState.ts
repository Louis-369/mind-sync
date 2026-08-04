"use client";

import { useStorage, useMutation, useOthers, useSelf, useMyPresence } from "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";
import { useState, useEffect, useCallback } from "react";
import { generateSeededDeck } from "../lib/gameLogic";
import { GameSettings, BoardCard } from "../types/game";

export function useGameState(roomId?: string) {
  const [myPresence, updateMyPresence] = useMyPresence();
  const self = useSelf();
  const others = useOthers();

  // 讀取 Liveblocks Storage 狀態
  const settings = useStorage((root) => root.settings);
  const boardMap = useStorage((root) => root.board);
  const lockedPlayers = useStorage((root) => root.lockedPlayers);
  const handCountsMap = useStorage((root) => root.handCounts);
  const dealTimestamp = useStorage((root) => root.dealTimestamp);
  const status = useStorage((root) => root.status);
  const result = useStorage((root) => root.result);
  const hostId = useStorage((root) => root.hostId);
  const playerJoinOrder = useStorage((root) => root.playerJoinOrder);

  // 本機手牌狀態 (純本機控制，不傳輸至 Storage，徹底防範 DevTools 窺探作弊)
  const [myHand, setMyHand] = useState<number[]>([]);
  const [lastHandDealTime, setLastHandDealTime] = useState<number>(0);

  const myPId = self?.presence?.playerId;
  const cardsPerPlayer = settings?.cardsPerPlayer || 2;

  // 轉為純 JS 資料格式
  const board: BoardCard[] = boardMap
    ? Array.from(boardMap.entries()).map(([uniqueKey, card]: [string, any]) => ({
        uniqueKey,
        slotId: card?.slotId || uniqueKey,
        playerId: card?.playerId || "",
        playerName: card?.playerName || "玩家",
        cardValue: card?.cardValue || 0,
        flipped: Boolean(card?.flipped),
        placedAt: card?.placedAt || Date.now(),
      }))
    : [];
  const lockedList = lockedPlayers ? Array.from(lockedPlayers) : [];

  // 整理線上活躍玩家清單 (按加入順序)
  const uniquePlayerIds = new Set<string>();
  if (myPId) uniquePlayerIds.add(myPId);
  others.forEach((o) => {
    if (o.presence?.playerId) uniquePlayerIds.add(o.presence.playerId);
  });

  const onlineOrder = (playerJoinOrder ? Array.from(playerJoinOrder) : []).filter((id) =>
    uniquePlayerIds.has(id)
  );
  if (myPId && !onlineOrder.includes(myPId)) {
    onlineOrder.push(myPId);
  }
  const myRank = myPId ? onlineOrder.indexOf(myPId) : 0;

  // 當開局 dealTimestamp 更新且進入 playing 狀態時，於本機生成全場一致的確定性手牌
  useEffect(() => {
    if (status === "playing" && dealTimestamp && dealTimestamp !== lastHandDealTime) {
      const seed = `${roomId || "default"}_${dealTimestamp}`;
      const deck = generateSeededDeck(seed);
      const startIdx = (myRank >= 0 ? myRank : 0) * cardsPerPlayer;
      const dealt = deck.slice(startIdx, startIdx + cardsPerPlayer).sort((a, b) => a - b);

      // 計算自己已放入盤面的牌，避免重連時覆蓋手牌
      const placedValues = new Set(
        board.filter((c) => c.playerId === myPId).map((c) => c.cardValue)
      );
      const remainingHand = dealt.filter((val) => !placedValues.has(val));

      setMyHand(remainingHand);
      setLastHandDealTime(dealTimestamp);
    } else if (status === "waiting" || status === "finished") {
      if (myHand.length > 0) setMyHand([]);
    }
  }, [status, dealTimestamp, lastHandDealTime, myRank, cardsPerPlayer, roomId, myPId]);

  // 計算盤面上是否有任何槽位發生撞牌 (超過 1 張牌)
  const slotCounts: Record<string, number> = {};
  board.forEach((c) => {
    if (c.slotId) {
      slotCounts[c.slotId] = (slotCounts[c.slotId] || 0) + 1;
    }
  });
  const hasBoardCollision = Object.values(slotCounts).some((cnt) => cnt > 1);

  // 發牌 mutation
  const dealCards = useMutation(({ storage }, currentMyPlayerId?: string) => {
    const mutableBoard = storage.get("board");
    const mutableLocked = storage.get("lockedPlayers");
    const mutableHandCounts = storage.get("handCounts");
    const mutableSettings = storage.get("settings");

    const perPlayerCount = mutableSettings.get("cardsPerPlayer") || 2;

    // 清空舊盤面與鎖定狀態
    Array.from(mutableBoard.keys()).forEach((k) => mutableBoard.delete(k));
    mutableLocked.clear();
    Array.from(mutableHandCounts.keys()).forEach((k) => mutableHandCounts.delete(k));

    // 給房主設定 (優先使用穩定 playerId)
    const myId = self?.presence?.playerId || currentMyPlayerId;
    if (!storage.get("hostId") && myId) {
      storage.set("hostId", myId);
    }

    // 收集獨立 playerId，初始化每位玩家的手牌張數紀錄
    const activePIds = new Set<string>();
    if (myId) activePIds.add(myId);
    others.forEach((o) => {
      if (o.presence?.playerId) activePIds.add(o.presence.playerId);
    });

    activePIds.forEach((pId) => {
      mutableHandCounts.set(pId, perPlayerCount);
    });

    storage.set("dealTimestamp", Date.now());
    storage.set("status", "playing");
    storage.set("result", null);
  }, [self, others]);

  // 玩家出牌 (從本機扣除手牌，放置到盤面)
  const placeCard = useMutation(
    (
      { storage },
      cardValue: number,
      playerName: string,
      targetSlotId?: string,
      currentMyPlayerId?: string
    ) => {
      const connId = String(self?.connectionId);
      const myId = self?.presence?.playerId || currentMyPlayerId || connId;
      const mutableBoard = storage.get("board");
      const mutableHandCounts = storage.get("handCounts");

      // 1. 從本機 React State 移除該張牌
      setMyHand((prev) => {
        const next = [...prev];
        const idx = next.indexOf(cardValue);
        if (idx !== -1) next.splice(idx, 1);
        return next;
      });

      // 2. 更新公共 Storage 的手牌張數
      const currentCount = mutableHandCounts.get(myId) ?? cardsPerPlayer;
      mutableHandCounts.set(myId, Math.max(0, currentCount - 1));

      // 3. 動態尋找第一個空白槽位 (slot-0, slot-1...)
      let finalSlotId = targetSlotId;
      if (!finalSlotId) {
        const occupiedSlots = new Set<string>();
        Array.from(mutableBoard.values()).forEach((c: any) => {
          const sId = c.get("slotId");
          if (sId) occupiedSlots.add(sId);
        });
        let i = 0;
        while (occupiedSlots.has(`slot-${i}`)) {
          i++;
        }
        finalSlotId = `slot-${i}`;
      }

      const uniqueKey = `${finalSlotId}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const newCard = new LiveObject({
        playerId: myId,
        connectionId: connId,
        playerName: playerName || "玩家",
        cardValue,
        flipped: false,
        placedAt: Date.now(),
        slotId: finalSlotId,
      });

      mutableBoard.set(uniqueKey, newCard);
    },
    [self, cardsPerPlayer]
  );

  // 玩家收回卡牌 (從盤面收回至本機手牌)
  const recallCard = useMutation(
    ({ storage }, targetKey: string, currentMyPlayerId?: string) => {
      const connId = String(self?.connectionId);
      const myId = self?.presence?.playerId || currentMyPlayerId || connId;
      const mutableBoard = storage.get("board");
      const mutableHandCounts = storage.get("handCounts");

      let targetBoardKey = targetKey;
      let card = mutableBoard.get(targetKey);

      const isMyCard = (c: any) => {
        const cardPId = c.get("playerId");
        const cardConnId = c.get("connectionId");
        return (cardPId === myId || cardPId === connId || cardConnId === connId) && !c.get("flipped");
      };

      if (!card || !isMyCard(card)) {
        const boardEntries = Array.from(mutableBoard.entries());
        for (const [k, v] of boardEntries) {
          if ((k === targetKey || v.get("slotId") === targetKey) && isMyCard(v)) {
            card = v;
            targetBoardKey = k;
            break;
          }
        }
      }

      if (card && isMyCard(card)) {
        const cardValue = card.get("cardValue");
        mutableBoard.delete(targetBoardKey);

        // 加回本機手牌
        setMyHand((prev) => [...prev, cardValue].sort((a, b) => a - b));

        // 更新 Storage 中的手牌張數
        const currentCount = mutableHandCounts.get(myId) ?? 0;
        mutableHandCounts.set(myId, currentCount + 1);

        // 解除鎖定
        const mutableLocked = storage.get("lockedPlayers");
        const lockIndexPId = mutableLocked.indexOf(myId);
        const lockIndexConnId = mutableLocked.indexOf(connId);
        if (lockIndexPId !== -1) mutableLocked.delete(lockIndexPId);
        if (lockIndexConnId !== -1) mutableLocked.delete(lockIndexConnId);
      }
    },
    [self]
  );

  // 切換玩家鎖定準備狀態
  const toggleLock = useMutation(
    ({ storage }, playerName: string, currentMyPlayerId?: string) => {
      const connId = String(self?.connectionId);
      const myId = self?.presence?.playerId || currentMyPlayerId || connId;
      const mutableBoard = storage.get("board");

      // 檢查檯面出牌數與本機剩餘手牌
      const currentBoard = Array.from(mutableBoard.values());
      const playerBoardCount = currentBoard.filter(
        (c) => c.get("playerId") === myId || c.get("playerId") === connId
      ).length;

      if (playerBoardCount < cardsPerPlayer || myHand.length > 0) {
        return;
      }

      // 檢查是否有撞牌
      const counts: Record<string, number> = {};
      currentBoard.forEach((c) => {
        const sId = c.get("slotId");
        if (sId) counts[sId] = (counts[sId] || 0) + 1;
      });
      if (Object.values(counts).some((cnt) => cnt > 1)) {
        return;
      }

      const mutableLocked = storage.get("lockedPlayers");
      const lockIndexPId = mutableLocked.indexOf(myId);
      const lockIndexConnId = mutableLocked.indexOf(connId);

      if (lockIndexPId !== -1) {
        mutableLocked.delete(lockIndexPId);
      } else if (lockIndexConnId !== -1) {
        mutableLocked.delete(lockIndexConnId);
      } else {
        mutableLocked.push(myId);
      }

      // 統計線上獨立玩家人數與鎖定完成度 (過濾離線 ID)
      const activePlayerIds = new Set<string>();
      if (myId) activePlayerIds.add(myId);
      others.forEach((o) => {
        if (o.presence?.playerId) activePlayerIds.add(o.presence.playerId);
      });

      const activeLockedCount = Array.from(mutableLocked).filter((id) => activePlayerIds.has(id)).length;

      if (activePlayerIds.size > 0 && activeLockedCount >= activePlayerIds.size) {
        storage.set("status", "locked");
      }
    },
    [self, others, cardsPerPlayer, myHand.length]
  );

  // 翻開盤面上屬於自己的卡牌並檢測勝負
  const flipCard = useMutation(
    ({ storage }, targetKey: string, currentMyPlayerId?: string) => {
      const connId = String(self?.connectionId);
      const myId = self?.presence?.playerId || currentMyPlayerId || connId;
      const mutableBoard = storage.get("board");
      let card = mutableBoard.get(targetKey);

      const isMyCard = (c: any) => {
        const cardPId = c.get("playerId");
        const cardConnId = c.get("connectionId");
        return (cardPId === myId || cardPId === connId || cardConnId === connId) && !c.get("flipped");
      };

      if (!card || !isMyCard(card)) {
        const boardEntries = Array.from(mutableBoard.entries());
        for (const [k, v] of boardEntries) {
          if ((k === targetKey || v.get("slotId") === targetKey) && isMyCard(v)) {
            card = v;
            break;
          }
        }
      }

      if (card && isMyCard(card)) {
        card.set("flipped", true);

        const allCards = Array.from(mutableBoard.values());
        const allFlipped = allCards.length > 0 && allCards.every((c) => c.get("flipped"));

        if (allFlipped) {
          // 依據槽位索引 (slot-0, slot-1...) 排序
          const sorted = [...allCards].sort((a, b) => {
            const slotA = parseInt((a.get("slotId") || "").replace("slot-", ""), 10) || 0;
            const slotB = parseInt((b.get("slotId") || "").replace("slot-", ""), 10) || 0;
            return slotA - slotB;
          });

          let isCorrect = true;
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].get("cardValue") > sorted[i + 1].get("cardValue")) {
              isCorrect = false;
              break;
            }
          }
          storage.set("status", "finished");
          storage.set("result", isCorrect ? "win" : "lose");
        }
      }
    },
    [self]
  );

  // 自動清理舊殘留房間與卡死救援
  const autoResetStaleRoom = useMutation(
    ({ storage }, currentMyPlayerId?: string) => {
      const activePlayerIds = new Set<string>();
      const myId = self?.presence?.playerId || currentMyPlayerId;
      if (myId) activePlayerIds.add(myId);

      others.forEach((o) => {
        if (o.presence?.playerId) {
          activePlayerIds.add(o.presence.playerId);
        }
      });

      const boardMap = storage.get("board");
      const handCountsMap = storage.get("handCounts");
      const currentStatus = storage.get("status");

      if (activePlayerIds.size <= 1) {
        if (boardMap.size > 0 || handCountsMap.size > 0 || currentStatus !== "waiting") {
          Array.from(boardMap.keys()).forEach((k) => boardMap.delete(k));
          storage.get("lockedPlayers").clear();
          Array.from(handCountsMap.keys()).forEach((k) => handCountsMap.delete(k));
          const mutableJoinOrder = storage.get("playerJoinOrder");
          if (mutableJoinOrder) {
            mutableJoinOrder.clear();
            if (myId) mutableJoinOrder.push(myId);
          }
          storage.set("status", "waiting");
          storage.set("result", null);
        }
        if (myId && storage.get("hostId") !== myId) {
          storage.set("hostId", myId);
        }
      }
    },
    [others, self]
  );

  // 自動聲明/維護房主身分
  const claimHost = useMutation(
    ({ storage }, currentMyPlayerId?: string) => {
      const currentHost = storage.get("hostId");
      let mutableJoinOrder = storage.get("playerJoinOrder");

      if (!mutableJoinOrder) {
        storage.set("playerJoinOrder", new LiveList([]));
        mutableJoinOrder = storage.get("playerJoinOrder");
      }

      const myId = self?.presence?.playerId || currentMyPlayerId;
      if (myId && mutableJoinOrder.indexOf(myId) === -1) {
        mutableJoinOrder.push(myId);
      }
      others.forEach((o) => {
        const pId = o.presence?.playerId;
        if (pId && mutableJoinOrder.indexOf(pId) === -1) {
          mutableJoinOrder.push(pId);
        }
      });

      const activePlayerIds = new Set<string>();
      if (myId) activePlayerIds.add(myId);
      others.forEach((o) => {
        if (o.presence?.playerId) activePlayerIds.add(o.presence.playerId);
      });

      const isHostPresent = currentHost && activePlayerIds.has(currentHost);
      if (!isHostPresent && activePlayerIds.size > 0) {
        const orderArray = Array.from(mutableJoinOrder);
        const firstActiveInOrder = orderArray.find((pId) => activePlayerIds.has(pId));
        if (firstActiveInOrder) {
          storage.set("hostId", firstActiveInOrder);
        } else {
          storage.set("hostId", Array.from(activePlayerIds)[0]);
        }
      }
    },
    [self, others]
  );

  // 更新遊戲設定
  const updateSettings = useMutation(({ storage }, newSettings: Partial<GameSettings>) => {
    if (storage.get("status") !== "waiting") return;
    const mutableSettings = storage.get("settings");
    Object.entries(newSettings).forEach(([key, val]) => {
      if (val !== undefined) {
        mutableSettings.set(key as any, val as any);
      }
    });
  }, []);

  // 當玩家離線時，清理鎖定標籤與離線記錄
  const syncOfflinePlayers = useMutation(
    ({ storage }, currentMyPlayerId?: string) => {
      const activePlayerIds = new Set<string>();
      const myId = self?.presence?.playerId || currentMyPlayerId;
      if (myId) activePlayerIds.add(myId);

      others.forEach((o) => {
        if (o.presence?.playerId) {
          activePlayerIds.add(o.presence.playerId);
        }
      });

      const mutableLocked = storage.get("lockedPlayers");
      for (let i = mutableLocked.length - 1; i >= 0; i--) {
        const lockedId = mutableLocked.get(i);
        if (lockedId && !activePlayerIds.has(lockedId)) {
          mutableLocked.delete(i);
        }
      }

      const mutableJoinOrder = storage.get("playerJoinOrder");
      if (mutableJoinOrder) {
        for (let i = mutableJoinOrder.length - 1; i >= 0; i--) {
          const joinId = mutableJoinOrder.get(i);
          if (joinId && !activePlayerIds.has(joinId)) {
            mutableJoinOrder.delete(i);
          }
        }
      }

      // 只有在至少 2 人在線且全員確實鎖定時才推進 status
      const activeLockedCount = Array.from(mutableLocked).filter((id) => activePlayerIds.has(id)).length;
      if (
        activePlayerIds.size >= 2 &&
        activeLockedCount >= activePlayerIds.size &&
        storage.get("status") === "playing"
      ) {
        storage.set("status", "locked");
      }
    },
    [others, self]
  );

  // 重置遊戲回到大廳等待
  const resetGame = useMutation(({ storage }) => {
    const boardMap = storage.get("board");
    const handCountsMap = storage.get("handCounts");
    Array.from(boardMap.keys()).forEach((k) => boardMap.delete(k));
    storage.get("lockedPlayers").clear();
    Array.from(handCountsMap.keys()).forEach((k) => handCountsMap.delete(k));
    setMyHand([]);
    storage.set("status", "waiting");
    storage.set("result", null);
  }, []);

  return {
    settings,
    board,
    lockedList,
    playerJoinOrder: playerJoinOrder ? Array.from(playerJoinOrder) : [],
    status,
    result,
    hostId,
    myHand,
    hasBoardCollision,
    myPresence,
    updateMyPresence,
    self,
    others,
    dealCards,
    placeCard,
    recallCard,
    toggleLock,
    flipCard,
    updateSettings,
    resetGame,
    claimHost,
    autoResetStaleRoom,
    syncOfflinePlayers,
  };
}
