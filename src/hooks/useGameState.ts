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
  const playerSlotsMap = useStorage((root) => root.playerSlots);
  const dealTimestamp = useStorage((root) => root.dealTimestamp);
  const status = useStorage((root) => root.status);
  const result = useStorage((root) => root.result);
  const hostId = useStorage((root) => root.hostId);
  const playerJoinOrder = useStorage((root) => root.playerJoinOrder);

  // 本機手牌狀態 (純本機控制，不傳輸至 Storage，徹底防範 DevTools 窺探作弊)
  const [myHand, setMyHand] = useState<number[]>([]);
  const [lastHandDealTime, setLastHandDealTime] = useState<number>(0);

  const myPId = self?.presence?.playerId;
  const myConnId = self?.connectionId ? String(self.connectionId) : "";
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

  // 輔助函式：收集當前線上活躍玩家 Set (包含 UUID 與 ConnectionId)
  const getActivePlayerIds = useCallback((): Set<string> => {
    const active = new Set<string>();
    if (myPId) active.add(myPId);
    if (myConnId) active.add(myConnId);
    others.forEach((o) => {
      if (o.presence?.playerId) active.add(o.presence.playerId);
      if (o.connectionId) active.add(String(o.connectionId));
    });
    return active;
  }, [myPId, myConnId, others]);

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

  // 優先從 Storage 顯式 playerSlots 讀取席位，若無則降級為動態 myRank
  const explicitSlot = myPId && playerSlotsMap ? playerSlotsMap.get(myPId) : undefined;
  const finalSlotIndex = explicitSlot !== undefined ? explicitSlot : Math.max(0, myRank);

  // 當開局 dealTimestamp 更新且進入 playing 狀態時，於本機生成全場一致的確定性手牌
  useEffect(() => {
    if (status === "playing" && dealTimestamp && dealTimestamp !== lastHandDealTime) {
      const seedKey = roomId ? `room_${roomId}` : "default_room";
      const seed = `${seedKey}_${dealTimestamp}`;
      const deck = generateSeededDeck(seed);
      const startIdx = finalSlotIndex * cardsPerPlayer;
      const dealt = deck.slice(startIdx, startIdx + cardsPerPlayer).sort((a, b) => a - b);

      // 計算自己已放入盤面的牌，避免重連時覆蓋手牌
      const placedValues = new Set(
        board.filter((c) => c.playerId === myPId || c.playerId === myConnId).map((c) => c.cardValue)
      );
      const remainingHand = dealt.filter((val) => !placedValues.has(val));

      setMyHand(remainingHand);
      setLastHandDealTime(dealTimestamp);
    } else if (status === "waiting" || status === "finished") {
      if (myHand.length > 0) setMyHand([]);
    }
  }, [status, dealTimestamp, lastHandDealTime, finalSlotIndex, cardsPerPlayer, roomId, myPId, myConnId, board, myHand.length]);

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
    const mutablePlayerSlots = storage.get("playerSlots");
    const mutableSettings = storage.get("settings");

    const perPlayerCount = mutableSettings.get("cardsPerPlayer") || 2;

    // 清空舊盤面與鎖定狀態
    Array.from(mutableBoard.keys()).forEach((k) => mutableBoard.delete(k));
    mutableLocked.clear();
    Array.from(mutableHandCounts.keys()).forEach((k) => mutableHandCounts.delete(k));
    Array.from(mutablePlayerSlots.keys()).forEach((k) => mutablePlayerSlots.delete(k));

    // 給房主設定
    const myId = self?.presence?.playerId || currentMyPlayerId;
    if (!storage.get("hostId") && myId) {
      storage.set("hostId", myId);
    }

    // 收集獨立 playerId，顯式配分席位 (0, 1, 2...) 與初始化手牌張數
    const activePIds = new Set<string>();
    if (myId) activePIds.add(myId);
    others.forEach((o) => {
      if (o.presence?.playerId) activePIds.add(o.presence.playerId);
    });

    // 至少需有 2 位玩家方可開局發牌
    if (activePIds.size < 2) {
      return;
    }

    let slotIdx = 0;
    activePIds.forEach((pId) => {
      mutablePlayerSlots.set(pId, slotIdx);
      mutableHandCounts.set(pId, perPlayerCount);
      slotIdx++;
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

        // 解除鎖定 (徹底清除所有鎖定紀錄)
        const mutableLocked = storage.get("lockedPlayers");
        let idx = -1;
        while ((idx = mutableLocked.indexOf(myId)) !== -1) {
          mutableLocked.delete(idx);
        }
        if (connId && connId !== myId) {
          while ((idx = mutableLocked.indexOf(connId)) !== -1) {
            mutableLocked.delete(idx);
          }
        }
      }
    },
    [self]
  );

  // 切換玩家鎖定準備狀態 (雙重驗證 pId 與 connId，100% 穩定進入 locked 狀態)
  const toggleLock = useMutation(
    ({ storage }, playerName: string, currentMyPlayerId?: string) => {
      const connId = String(self?.connectionId);
      const myId = self?.presence?.playerId || currentMyPlayerId || connId;
      const mutableBoard = storage.get("board");

      // 檢查檯面出牌數與本機剩餘手牌
      const currentBoard = Array.from(mutableBoard.values());
      const playerBoardCount = currentBoard.filter(
        (c) => c.get("playerId") === myId || c.get("playerId") === connId || c.get("connectionId") === connId
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
      const isAlreadyLocked =
        mutableLocked.indexOf(myId) !== -1 || (connId && mutableLocked.indexOf(connId) !== -1);

      if (isAlreadyLocked) {
        // 確實清除該玩家在 lockedPlayers 中的所有紀錄
        let idx = -1;
        while ((idx = mutableLocked.indexOf(myId)) !== -1) {
          mutableLocked.delete(idx);
        }
        if (connId && connId !== myId) {
          while ((idx = mutableLocked.indexOf(connId)) !== -1) {
            mutableLocked.delete(idx);
          }
        }
      } else {
        mutableLocked.push(myId);
        if (connId && connId !== myId) {
          mutableLocked.push(connId);
        }
      }

      const lockedArray = Array.from(mutableLocked);
      const lockedPlayerSet = new Set(lockedArray);

      // 精準判定線上「每一位玩家」個自的鎖定狀態
      const isSelfLocked = lockedPlayerSet.has(myId) || (connId && lockedPlayerSet.has(connId));

      const otherLockStates = others.map((o) => {
        const oPId = o.presence?.playerId;
        const oConnId = String(o.connectionId);
        return Boolean(
          (oPId && lockedPlayerSet.has(oPId)) ||
          (oConnId && lockedPlayerSet.has(oConnId))
        );
      });

      const isAllPlayersLocked = Boolean(isSelfLocked) && (otherLockStates.length === 0 || otherLockStates.every(Boolean));

      const totalPlayersInGame = Math.max(2, storage.get("playerSlots")?.size || (others.length + 1));
      const expectedTotalCards = totalPlayersInGame * cardsPerPlayer;
      const placedCardsCount = currentBoard.length;

      // 100% 穩定判定全場鎖定：必須「所有玩家」均已獨立鎖定，且盤面張數放滿方可觸發翻牌鎖定！
      if (
        totalPlayersInGame >= 2 &&
        placedCardsCount >= expectedTotalCards &&
        isAllPlayersLocked
      ) {
        storage.set("status", "locked");
      }
    },
    [self, cardsPerPlayer, myHand.length]
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

  // 自動清理完全廢棄的空房間 (絕不在遊玩中因玩家暫時切換 App 誤重置房間)
  const autoResetStaleRoom = useMutation(
    ({ storage }, currentMyPlayerId?: string) => {
      const activePlayerIds = getActivePlayerIds();
      const myId = self?.presence?.playerId || currentMyPlayerId;

      const boardMap = storage.get("board");
      const handCountsMap = storage.get("handCounts");
      const currentStatus = storage.get("status");

      // 只有當全房間完全沒有活躍玩家 (0人) 時才執行重置清理；若為遊玩中 (playing/locked) 則絕對保留牌局！
      if (activePlayerIds.size === 0) {
        if (boardMap.size > 0 || handCountsMap.size > 0 || currentStatus !== "waiting") {
          Array.from(boardMap.keys()).forEach((k) => boardMap.delete(k));
          storage.get("lockedPlayers").clear();
          Array.from(handCountsMap.keys()).forEach((k) => handCountsMap.delete(k));
          const mutablePlayerSlots = storage.get("playerSlots");
          if (mutablePlayerSlots) Array.from(mutablePlayerSlots.keys()).forEach((k) => mutablePlayerSlots.delete(k));
          const mutableJoinOrder = storage.get("playerJoinOrder");
          if (mutableJoinOrder) mutableJoinOrder.clear();
          storage.set("status", "waiting");
          storage.set("result", null);
        }
      }

      // 若目前無房主或房主已空缺，維護首位玩家為房主
      if (myId && (!storage.get("hostId") || activePlayerIds.size === 1)) {
        storage.set("hostId", myId);
      }
    },
    [self, getActivePlayerIds]
  );

  // 自動聲明/維護房主身分 (首位進房玩家即刻為房主)
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

      const activePIds = new Set<string>();
      if (myId) activePIds.add(myId);
      others.forEach((o) => {
        if (o.presence?.playerId) activePIds.add(o.presence.playerId);
      });

      // 若無房主或目前只有 1 人進房，立刻聲明房主身分
      if (!currentHost || activePIds.size === 1 || !activePIds.has(currentHost)) {
        if (myId) {
          storage.set("hostId", myId);
        } else if (activePIds.size > 0) {
          storage.set("hostId", Array.from(activePIds)[0]);
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

  // 當玩家離線時，保持遊戲狀態，防止手機鎖屏/切 App 誤觸自動結算
  const syncOfflinePlayers = useMutation(
    ({ storage }, currentMyPlayerId?: string) => {
      const activePIds = new Set<string>();
      const myId = self?.presence?.playerId || currentMyPlayerId;
      if (myId) activePIds.add(myId);
      others.forEach((o) => {
        if (o.presence?.playerId) activePIds.add(o.presence.playerId);
      });

      // 當全場活躍玩家都同意鎖定時，觸發轉鎖定
      const mutableLocked = storage.get("lockedPlayers");
      const lockedSet = new Set(Array.from(mutableLocked));
      const activeLockedCount = Array.from(activePIds).filter((id) => lockedSet.has(id)).length;

      const mutableBoard = storage.get("board");
      const mutableSettings = storage.get("settings");
      const perPlayerCount = mutableSettings.get("cardsPerPlayer") || 2;
      const playerSlotsMap = storage.get("playerSlots");
      const totalPlayersInGame = playerSlotsMap?.size || activePIds.size;
      const expectedTotalCards = totalPlayersInGame * perPlayerCount;

      if (
        activePIds.size >= 1 &&
        mutableBoard.size >= expectedTotalCards &&
        activeLockedCount >= activePIds.size &&
        storage.get("status") === "playing"
      ) {
        storage.set("status", "locked");
      }
    },
    [self, others]
  );

  // 重置遊戲回到大廳等待
  const resetGame = useMutation(({ storage }) => {
    const boardMap = storage.get("board");
    const handCountsMap = storage.get("handCounts");
    const playerSlotsMap = storage.get("playerSlots");
    Array.from(boardMap.keys()).forEach((k) => boardMap.delete(k));
    storage.get("lockedPlayers").clear();
    Array.from(handCountsMap.keys()).forEach((k) => handCountsMap.delete(k));
    if (playerSlotsMap) Array.from(playerSlotsMap.keys()).forEach((k) => playerSlotsMap.delete(k));
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
