"use client";

import { useStorage, useMutation, useOthers, useSelf, useMyPresence } from "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";
import { useCallback } from "react";
import { generateShuffledDeck } from "../lib/gameLogic";
import { GameSettings, BoardCard } from "../types/game";

export function useGameState() {
  const [myPresence, updateMyPresence] = useMyPresence();
  const self = useSelf();
  const others = useOthers();

  // 讀取 Liveblocks Storage 狀態
  const settings = useStorage((root) => root.settings);
  const boardMap = useStorage((root) => root.board);
  const lockedPlayers = useStorage((root) => root.lockedPlayers);
  const handsMap = useStorage((root) => root.hands);
  const status = useStorage((root) => root.status);
  const result = useStorage((root) => root.result);
  const hostId = useStorage((root) => root.hostId);
  const lives = useStorage((root) => root.lives);
  const shurikens = useStorage((root) => root.shurikens);
  const currentLevel = useStorage((root) => root.currentLevel);

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
    const mutableSettings = storage.get("settings");
    const mutableBoard = storage.get("board");
    const mutableLocked = storage.get("lockedPlayers");
    const mutableHands = storage.get("hands");

    const cardsPerPlayer = mutableSettings.get("cardsPerPlayer");
    const deck = generateShuffledDeck();

    // 清空舊盤面與鎖定狀態
    Array.from(mutableBoard.keys()).forEach((k) => mutableBoard.delete(k));
    mutableLocked.clear();
    Array.from(mutableHands.keys()).forEach((k) => mutableHands.delete(k));

    // 給房主設定 (優先使用穩定 playerId)
    const myPId = self?.presence?.playerId || currentMyPlayerId;
    if (!storage.get("hostId") && myPId) {
      storage.set("hostId", myPId);
    }

    // 發牌給當前線上所有人 (收集 unique playerId，雙重備用相容 connectionId)
    let cardIndex = 0;
    const playerMap = new Map<string, string>(); // pId -> connIdStr
    if (myPId) {
      playerMap.set(myPId, String(self?.connectionId));
    }
    others.forEach((o) => {
      const pId = o.presence?.playerId || String(o.connectionId);
      if (pId) {
        playerMap.set(pId, String(o.connectionId));
      }
    });

    playerMap.forEach((connIdStr, pId) => {
      const playerHandCards = deck.slice(cardIndex, cardIndex + cardsPerPlayer).sort((a, b) => a - b);
      cardIndex += cardsPerPlayer;

      const list = new LiveList(playerHandCards);
      // 以唯一 playerId 作為主鍵 (移除重複 connectionId 備用鍵，防止殘留雙倍手牌)
      mutableHands.set(pId, list);
    });

    storage.set("status", "playing");
    storage.set("result", null);
  }, [self, others]);

  // 玩家出牌 (放置卡牌到盤面，可指定 targetSlotId 槽位)
  const placeCard = useMutation(
    ({ storage }, cardValue: number, playerName: string, targetSlotId?: string, currentMyPlayerId?: string) => {
      const connId = String(self?.connectionId);
      const myPId = self?.presence?.playerId || currentMyPlayerId || connId;
      const mutableHands = storage.get("hands");
      const mutableBoard = storage.get("board");

      // 優先以 myPId 從手牌扣除，若無則降級為 connId
      let playerHand = mutableHands.get(myPId);
      if (!playerHand || playerHand.length === 0) {
        playerHand = mutableHands.get(connId);
      }

      if (playerHand) {
        const index = playerHand.indexOf(cardValue);
        if (index !== -1) {
          playerHand.delete(index);
        }
      }

      // 動態尋找盤面上第一個完全空白的槽位 ID (slot-0, slot-1, slot-2...)，防止收回牌後出牌號碼衝突
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
        playerId: myPId,
        connectionId: connId,
        playerName: playerName || "玩家",
        cardValue,
        flipped: false,
        placedAt: Date.now(),
        slotId: finalSlotId,
      });

      mutableBoard.set(uniqueKey, newCard);
    },
    [self]
  );

  // 玩家收回卡牌 (從盤面收回手牌)
  const recallCard = useMutation(({ storage }, targetKey: string, currentMyPlayerId?: string) => {
    const connId = String(self?.connectionId);
    const myPId = self?.presence?.playerId || currentMyPlayerId || connId;
    const mutableBoard = storage.get("board");
    const mutableHands = storage.get("hands");

    let targetBoardKey = targetKey;
    let card = mutableBoard.get(targetKey);

    const isMyCard = (c: any) => {
      const cardPId = c.get("playerId");
      const cardConnId = c.get("connectionId");
      return (cardPId === myPId || cardPId === connId || cardConnId === connId) && !c.get("flipped");
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

      let playerHand = mutableHands.get(myPId);
      if (!playerHand) playerHand = mutableHands.get(connId);

      if (playerHand) {
        playerHand.push(cardValue);
        const currentArr = playerHand.toArray().sort((a, b) => a - b);
        playerHand.clear();
        currentArr.forEach((val) => playerHand.push(val));
      }

      // 自動解除鎖定標籤 (若該玩家先前已同意鎖定，收回卡牌後自動恢復未鎖定狀態)
      const mutableLocked = storage.get("lockedPlayers");
      const lockIndexPId = mutableLocked.indexOf(myPId);
      const lockIndexConnId = mutableLocked.indexOf(connId);
      if (lockIndexPId !== -1) mutableLocked.delete(lockIndexPId);
      if (lockIndexConnId !== -1) mutableLocked.delete(lockIndexConnId);
    }
  }, [self]);

  // 切換玩家鎖定準備狀態
  const toggleLock = useMutation(({ storage }, playerName: string, currentMyPlayerId?: string) => {
    const connId = String(self?.connectionId);
    const myPId = self?.presence?.playerId || currentMyPlayerId || connId;
    const mutableHands = storage.get("hands");
    const mutableBoard = storage.get("board");

    // 1. 嚴格檢查該玩家檯面上出牌張數是否到達規定每人發牌張數
    const cardsPerPlayer = storage.get("settings")?.get("cardsPerPlayer") || 2;
    const currentBoard = Array.from(mutableBoard.values());
    const playerBoardCount = currentBoard.filter(
      (c) => c.get("playerId") === myPId || c.get("playerId") === connId
    ).length;

    let playerHand = mutableHands.get(myPId);
    if (!playerHand) playerHand = mutableHands.get(connId);
    const remainingHandCount = playerHand ? playerHand.length : 0;

    // 嚴格阻斷：若該玩家檯面出牌未滿規定張數，或手牌尚有剩餘，絕對禁止同意鎖定！
    if (playerBoardCount < cardsPerPlayer || remainingHandCount > 0) {
      return;
    }

    // 2. 檢查盤面上是否有撞牌 (多張牌放置在同一槽位)
    const counts: Record<string, number> = {};
    currentBoard.forEach((c) => {
      const sId = c.get("slotId");
      if (sId) counts[sId] = (counts[sId] || 0) + 1;
    });
    if (Object.values(counts).some((cnt) => cnt > 1)) {
      return;
    }

    const mutableLocked = storage.get("lockedPlayers");
    const lockIndexPId = mutableLocked.indexOf(myPId);
    const lockIndexConnId = mutableLocked.indexOf(connId);

    if (lockIndexPId !== -1) {
      mutableLocked.delete(lockIndexPId);
    } else if (lockIndexConnId !== -1) {
      mutableLocked.delete(lockIndexConnId);
    } else {
      mutableLocked.push(myPId);
    }

    // 統計線上獨立玩家人數與鎖定完成度 (精準過濾離線殘留 ID)
    const activePlayerIds = new Set<string>();
    if (myPId) activePlayerIds.add(myPId);
    others.forEach((o) => {
      if (o.presence?.playerId) activePlayerIds.add(o.presence.playerId);
    });

    const activeLockedCount = Array.from(mutableLocked).filter((id) => activePlayerIds.has(id)).length;

    if (activePlayerIds.size > 0 && activeLockedCount >= activePlayerIds.size) {
      storage.set("status", "locked");
    }
  }, [self, others]);

  // 翻開盤面上屬於自己的特定卡牌
  const flipCard = useMutation(({ storage }, targetKey: string, currentMyPlayerId?: string) => {
    const connId = String(self?.connectionId);
    const myPId = self?.presence?.playerId || currentMyPlayerId || connId;
    const mutableBoard = storage.get("board");
    let card = mutableBoard.get(targetKey);

    const isMyCard = (c: any) => {
      const cardPId = c.get("playerId");
      const cardConnId = c.get("connectionId");
      return (cardPId === myPId || cardPId === connId || cardConnId === connId) && !c.get("flipped");
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

    // 只能翻開自己出的牌
    if (card && isMyCard(card)) {
      card.set("flipped", true);

      // 檢查是否盤面上所有卡片都已翻開
      const allCards = Array.from(mutableBoard.values());
      const allFlipped = allCards.length > 0 && allCards.every((c) => c.get("flipped"));

      if (allFlipped) {
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
  }, [self]);

  // 自動清理舊殘留房間與極端無牌卡死救援 (autoResetStaleRoom & autoRecoverStaleState)
  const autoResetStaleRoom = useMutation(({ storage }, currentMyPlayerId?: string) => {
    const activePlayerIds = new Set<string>();
    const myPId = self?.presence?.playerId || currentMyPlayerId;
    if (myPId) activePlayerIds.add(myPId);

    others.forEach((o) => {
      if (o.presence?.playerId) {
        activePlayerIds.add(o.presence.playerId);
      }
    });

    const boardMap = storage.get("board");
    const handsMap = storage.get("hands");
    const currentStatus = storage.get("status");

    // 1. 全房僅剩 1 位獨立玩家且存在舊牌局殘留，進行清理 (維護房間乾淨度)
    if (activePlayerIds.size <= 1) {
      if (boardMap.size > 0 || handsMap.size > 0 || currentStatus !== "waiting") {
        Array.from(boardMap.keys()).forEach((k) => boardMap.delete(k));
        storage.get("lockedPlayers").clear();
        Array.from(handsMap.keys()).forEach((k) => handsMap.delete(k));
        const mutableJoinOrder = storage.get("playerJoinOrder");
        if (mutableJoinOrder) {
          mutableJoinOrder.clear();
          if (myPId) mutableJoinOrder.push(myPId);
        }
        storage.set("status", "waiting");
        storage.set("result", null);
      }
      if (myPId && storage.get("hostId") !== myPId) {
        storage.set("hostId", myPId);
      }
    }

    // 2. 極端卡死救援 (autoRecoverStaleState)：若狀態為 playing 或 locked，但檯面張數為 0 且線上手牌皆為空，自動重置為 waiting
    if (currentStatus === "playing" || currentStatus === "locked") {
      let totalHandCards = 0;
      handsMap.forEach((hList) => {
        totalHandCards += hList.length;
      });
      if (boardMap.size === 0 && totalHandCards === 0) {
        Array.from(boardMap.keys()).forEach((k) => boardMap.delete(k));
        storage.get("lockedPlayers").clear();
        Array.from(handsMap.keys()).forEach((k) => handsMap.delete(k));
        storage.set("status", "waiting");
        storage.set("result", null);
      }
    }
  }, [others, self]);

  // 使用手裏劍技能 (每人自動亮出並移除手上最小的一張牌)
  const useShuriken = useMutation(({ storage }) => {
    const currentShurikens = storage.get("shurikens");
    if (currentShurikens <= 0) return;

    storage.set("shurikens", currentShurikens - 1);
    const mutableHands = storage.get("hands");
    const mutableBoard = storage.get("board");

    // 所有玩家拋棄最小牌
    mutableHands.forEach((handList, connId) => {
      if (handList.length > 0) {
        const sortedHand = handList.toArray().sort((a, b) => a - b);
        const smallestCard = sortedHand[0];
        
        // 刪除最小牌
        const idx = handList.indexOf(smallestCard);
        if (idx !== -1) handList.delete(idx);

        // 自動以翻開狀態放到盤面
        const slotId = `shuriken-${Date.now()}-${connId}`;
        const newCard = new LiveObject({
          playerId: connId,
          playerName: "手裏劍棄牌",
          cardValue: smallestCard,
          flipped: true,
          placedAt: Date.now(),
        });
        mutableBoard.set(slotId, newCard);
      }
    });
  }, []);

  const playerJoinOrder = useStorage((root) => root.playerJoinOrder);

  // 自動聲明/維護房主身分 (無房主或原房主離線時，嚴格依據 playerJoinOrder 順序精準遞補)
  const claimHost = useMutation(({ storage }, currentMyPlayerId?: string) => {
    const currentHost = storage.get("hostId");
    let mutableJoinOrder = storage.get("playerJoinOrder");

    // 若 LiveList 尚未初始化
    if (!mutableJoinOrder) {
      storage.set("playerJoinOrder", new LiveList([]));
      mutableJoinOrder = storage.get("playerJoinOrder");
    }

    const myPId = self?.presence?.playerId || currentMyPlayerId;
    
    // 1. 將自己與在線玩家寫入進房時間順序清單 (若尚未存在)
    if (myPId && mutableJoinOrder.indexOf(myPId) === -1) {
      mutableJoinOrder.push(myPId);
    }
    others.forEach((o) => {
      const pId = o.presence?.playerId;
      if (pId && mutableJoinOrder.indexOf(pId) === -1) {
        mutableJoinOrder.push(pId);
      }
    });

    // 2. 收集目前線上的所有獨立 playerId
    const activePlayerIds = new Set<string>();
    if (myPId) activePlayerIds.add(myPId);
    others.forEach((o) => {
      if (o.presence?.playerId) activePlayerIds.add(o.presence.playerId);
    });

    const isHostPresent = currentHost && activePlayerIds.has(currentHost);

    // 3. 若原房主離線或未指定，依據 playerJoinOrder 尋找最先進房的線上玩家接任房主
    if (!isHostPresent && activePlayerIds.size > 0) {
      const orderArray = Array.from(mutableJoinOrder);
      const firstActiveInOrder = orderArray.find((pId) => activePlayerIds.has(pId));
      if (firstActiveInOrder) {
        storage.set("hostId", firstActiveInOrder);
      } else {
        storage.set("hostId", Array.from(activePlayerIds)[0]);
      }
    }
  }, [self, others]);

  // 更新遊戲設定 (雙重防護：嚴格限制只能在大廳等待 status === "waiting" 時修改設定)
  const updateSettings = useMutation(({ storage }, newSettings: Partial<GameSettings>) => {
    if (storage.get("status") !== "waiting") return;

    const mutableSettings = storage.get("settings");
    Object.entries(newSettings).forEach(([key, val]) => {
      if (val !== undefined) {
        mutableSettings.set(key as any, val as any);
      }
    });
  }, []);

  // 當玩家離線時，自動清理其 Storage 鎖定標籤與歷史進房順序 UUID (保留已發手牌以相容重新整理重連)
  const syncOfflinePlayers = useMutation(({ storage }, currentMyPlayerId?: string) => {
    const activePlayerIds = new Set<string>();
    const myPId = self?.presence?.playerId || currentMyPlayerId;
    if (myPId) activePlayerIds.add(myPId);

    others.forEach((o) => {
      if (o.presence?.playerId) {
        activePlayerIds.add(o.presence.playerId);
      }
    });

    const mutableLocked = storage.get("lockedPlayers");
    const mutableHands = storage.get("hands");

    // 1. 刪除不在線上玩家的鎖定標籤
    for (let i = mutableLocked.length - 1; i >= 0; i--) {
      const lockedId = mutableLocked.get(i);
      if (lockedId && !activePlayerIds.has(lockedId)) {
        mutableLocked.delete(i);
      }
    }

    // 2. 清理已離線玩家的殘留手牌 (防止離線手牌卡死發牌/鎖定)
    if (storage.get("status") === "playing") {
      Array.from(mutableHands.keys()).forEach((handKey) => {
        if (!activePlayerIds.has(handKey)) {
          mutableHands.delete(handKey);
        }
      });
    }

    // 3. 清理已離線玩家的歷史進房順序 UUID (維護 playerJoinOrder 乾淨度)
    const mutableJoinOrder = storage.get("playerJoinOrder");
    if (mutableJoinOrder) {
      for (let i = mutableJoinOrder.length - 1; i >= 0; i--) {
        const joinId = mutableJoinOrder.get(i);
        if (joinId && !activePlayerIds.has(joinId)) {
          mutableJoinOrder.delete(i);
        }
      }
    }

    // 4. 若所有線上剩餘玩家均已完成鎖定，自動推進 status 為 "locked"
    const activeLockedCount = Array.from(mutableLocked).filter((id) => activePlayerIds.has(id)).length;
    if (
      activePlayerIds.size > 0 &&
      activeLockedCount >= activePlayerIds.size &&
      storage.get("status") === "playing"
    ) {
      storage.set("status", "locked");
    }
  }, [others, self]);

  // 重置遊戲回到大廳等待
  const resetGame = useMutation(({ storage }) => {
    const boardMap = storage.get("board");
    const handsMap = storage.get("hands");
    Array.from(boardMap.keys()).forEach((k) => boardMap.delete(k));
    storage.get("lockedPlayers").clear();
    Array.from(handsMap.keys()).forEach((k) => handsMap.delete(k));
    storage.set("status", "waiting");
    storage.set("result", null);
  }, []);

  // 取得當前自己的手牌 (優先依據穩定 playerId 讀取，降級相容 connectionId)
  const myPId = self?.presence?.playerId;
  const connIdStr = String(self?.connectionId);
  const myHandList = handsMap
    ? (myPId && handsMap.get(myPId)) || handsMap.get(connIdStr)
    : null;
  const myHand = myHandList ? Array.from(myHandList) : [];

  return {
    settings,
    board,
    lockedList,
    playerJoinOrder: playerJoinOrder ? Array.from(playerJoinOrder) : [],
    status,
    result,
    hostId,
    lives,
    shurikens,
    currentLevel,
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
    useShuriken,
    updateSettings,
    resetGame,
    claimHost,
    autoResetStaleRoom,
    syncOfflinePlayers,
  };
}
