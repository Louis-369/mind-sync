"use client";

import { useStorage, useMutation, useOthers, useSelf, useMyPresence } from "@liveblocks/react";
import { useCallback } from "react";
import { generateShuffledDeck } from "../lib/gameLogic";
import { GameSettings } from "../types/game";

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
  const board = boardMap ? Array.from(boardMap.entries()).map(([slotId, card]) => ({ slotId, ...card })) : [];
  const lockedList = lockedPlayers ? Array.from(lockedPlayers) : [];

  // 發牌 mutation
  const dealCards = useMutation(({ storage }) => {
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

    // 給房主設定
    if (!storage.get("hostId") && self?.connectionId) {
      storage.set("hostId", String(self.connectionId));
    }

    // 發牌給當前線上所有人 (包括自己)
    let cardIndex = 0;
    const allConnectionIds = [self?.connectionId, ...others.map((o) => o.connectionId)].filter(Boolean);

    allConnectionIds.forEach((connId) => {
      const playerHandCards = deck.slice(cardIndex, cardIndex + cardsPerPlayer).sort((a, b) => a - b);
      cardIndex += cardsPerPlayer;

      // 建立 LiveList
      const list = new (require("@liveblocks/client").LiveList)(playerHandCards);
      mutableHands.set(String(connId), list);
    });

    storage.set("status", "playing");
    storage.set("result", null);
  }, [self, others]);

  // 玩家出牌 (放置卡牌到盤面)
  const placeCard = useMutation(({ storage }, cardValue: number, playerName: string) => {
    const connId = String(self?.connectionId);
    const mutableHands = storage.get("hands");
    const mutableBoard = storage.get("board");

    const playerHand = mutableHands.get(connId);
    if (playerHand) {
      const index = playerHand.indexOf(cardValue);
      if (index !== -1) {
        playerHand.delete(index);
      }
    }

    // 將卡片放入盤面 (使用時間戳為唯一 key)
    const slotId = `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newCard = new (require("@liveblocks/client").LiveObject)({
      playerId: connId,
      playerName: playerName || "玩家",
      cardValue,
      flipped: false,
      placedAt: Date.now(),
    });

    mutableBoard.set(slotId, newCard);
  }, [self]);

  // 玩家收回卡片 (從盤面收回手牌)
  const recallCard = useMutation(({ storage }, slotId: string) => {
    const connId = String(self?.connectionId);
    const mutableBoard = storage.get("board");
    const mutableHands = storage.get("hands");

    const card = mutableBoard.get(slotId);
    if (card && card.get("playerId") === connId && !card.get("flipped")) {
      const cardValue = card.get("cardValue");
      mutableBoard.delete(slotId);

      const playerHand = mutableHands.get(connId);
      if (playerHand) {
        playerHand.push(cardValue);
        // 重新排序
        const currentArr = playerHand.toArray().sort((a, b) => a - b);
        playerHand.clear();
        currentArr.forEach((val) => playerHand.push(val));
      }
    }
  }, [self]);

  // 切換玩家鎖定準備狀態
  const toggleLock = useMutation(({ storage }, playerName: string) => {
    const connId = String(self?.connectionId);
    const mutableLocked = storage.get("lockedPlayers");
    const lockIndex = mutableLocked.indexOf(connId);

    if (lockIndex !== -1) {
      mutableLocked.delete(lockIndex);
    } else {
      mutableLocked.push(connId);
    }

    // 檢查是否所有玩家都已鎖定
    const totalPlayers = others.length + 1;
    if (mutableLocked.length >= totalPlayers) {
      storage.set("status", "locked");
    }
  }, [self, others]);

  // 翻開盤面上屬於自己的特定卡牌
  const flipCard = useMutation(({ storage }, slotId: string) => {
    const connId = String(self?.connectionId);
    const mutableBoard = storage.get("board");
    const card = mutableBoard.get(slotId);

    // 只能翻開自己出的牌
    if (card && card.get("playerId") === connId && !card.get("flipped")) {
      card.set("flipped", true);

      // 檢查是否盤面上所有卡片都已翻開
      const allCards = Array.from(mutableBoard.values());
      const allFlipped = allCards.length > 0 && allCards.every((c) => c.get("flipped"));

      if (allFlipped) {
        // 檢查順序
        const sorted = [...allCards].sort((a, b) => a.get("placedAt") - b.get("placedAt"));
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

  // 當發現舊房間狀態殘留（例如非等待狀態但無其他玩家），自動清理重置
  const autoResetStaleRoom = useMutation(({ storage }) => {
    const currentStatus = storage.get("status");
    // 如果不是等待階段，且全房只有自己一人（others.length === 0）
    if (currentStatus !== "waiting" && others.length === 0) {
      const boardMap = storage.get("board");
      const handsMap = storage.get("hands");
      Array.from(boardMap.keys()).forEach((k) => boardMap.delete(k));
      storage.get("lockedPlayers").clear();
      Array.from(handsMap.keys()).forEach((k) => handsMap.delete(k));
      storage.set("status", "waiting");
      storage.set("result", null);
      if (self?.connectionId) {
        storage.set("hostId", String(self.connectionId));
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
        const newCard = new (require("@liveblocks/client").LiveObject)({
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

  // 自動聲明/維護房主身分 (無房主或原房主離線時自動遞補)
  const claimHost = useMutation(({ storage }) => {
    const currentHost = storage.get("hostId");
    const myConnId = self?.connectionId ? String(self.connectionId) : null;
    if (!myConnId) return;

    const allIds = [self?.connectionId, ...others.map((o) => o.connectionId)].filter(Boolean).map(String);
    const isHostPresent = currentHost && allIds.includes(currentHost);

    if (!isHostPresent && allIds.length > 0) {
      // 最早連線的玩家自動繼承房主
      const sortedIds = [...allIds].sort((a, b) => Number(a) - Number(b));
      storage.set("hostId", sortedIds[0]);
    }
  }, [self, others]);

  // 更新遊戲設定
  const updateSettings = useMutation(({ storage }, newSettings: Partial<GameSettings>) => {
    const mutableSettings = storage.get("settings");
    Object.entries(newSettings).forEach(([key, val]) => {
      if (val !== undefined) {
        mutableSettings.set(key as any, val as any);
      }
    });
  }, []);

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

  // 取得當前自己的手牌
  const connIdStr = String(self?.connectionId);
  const myHandList = handsMap ? handsMap.get(connIdStr) : null;
  const myHand = myHandList ? Array.from(myHandList) : [];

  return {
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
  };
}
