"use client";

import React, { useState, useEffect } from "react";
import { Users, Copy, Check, Settings, Edit3, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { sound } from "../../lib/soundEngine";

interface GameStatusProps {
  roomId: string;
  connectedCount: number;
  maxPlayers: number;
  playerName?: string;
  isHost?: boolean;
  onOpenHostPanel?: () => void;
  onChangePlayerName?: (newName: string) => void;
  onLeaveRoom?: () => void;
}

export function GameStatus({
  roomId,
  connectedCount,
  maxPlayers,
  playerName = "",
  isHost = false,
  onOpenHostPanel,
  onChangePlayerName,
  onLeaveRoom,
}: GameStatusProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(playerName);
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    setMuted(sound.isMuted());
  }, []);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        sound.playSlotTap();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("複製房間網址失敗:", error);
    }
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  const handleSaveName = () => {
    if (tempName.trim() && onChangePlayerName) {
      onChangePlayerName(tempName.trim());
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl px-2.5 sm:px-4 py-1.5 my-1 flex items-center justify-between gap-2 border-ukiyo-gold/30 shadow-xl relative z-20">
      {/* 左側：離開按鈕 + 房間代碼一鍵複製 */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            title="離開席位"
            className="flex items-center gap-1 text-[11px] sm:text-xs text-ukiyo-mist hover:text-ukiyo-foam bg-ukiyo-surface/60 hover:bg-ukiyo-surface px-2.5 py-1 rounded-xl border border-ukiyo-foam/15 transition-all cursor-pointer font-serif touch-manipulation active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">離席</span>
          </button>
        )}

        {/* 房間暗號與複製膠囊 */}
        <button
          onClick={handleCopyLink}
          title="點擊複製邀請連結"
          className="flex items-center space-x-1.5 bg-ukiyo-bg/85 hover:bg-ukiyo-surface/90 px-2.5 py-1 rounded-xl border border-ukiyo-gold/40 shadow-inner cursor-pointer transition-colors active:scale-95"
        >
          <span className="text-xs sm:text-sm font-bold text-ukiyo-gold font-mono tracking-wider">{roomId}</span>
          <span className="text-ukiyo-mist">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </span>
        </button>

        {/* 個人稱號 (點選修改) */}
        {playerName && onChangePlayerName && (
          <button
            onClick={() => {
              setTempName(playerName);
              setIsEditModalOpen(true);
            }}
            title="點擊修改稱號"
            className="hidden md:flex items-center gap-1.5 text-xs text-ukiyo-foam/90 bg-ukiyo-surface/80 hover:bg-ukiyo-surface px-2.5 py-1 rounded-xl border border-ukiyo-foam/15 transition-all cursor-pointer font-serif active:scale-95"
          >
            <span className="font-bold truncate max-w-[90px] text-ukiyo-gold">{playerName}</span>
            <Edit3 className="w-3 h-3 text-ukiyo-gold" />
          </button>
        )}
      </div>

      {/* 右側：靜音開關 + 人數膠囊 + 房主設定 */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-serif">
        {/* 手機端稱號修改圖示 */}
        {playerName && onChangePlayerName && (
          <button
            onClick={() => {
              setTempName(playerName);
              setIsEditModalOpen(true);
            }}
            title="修改稱號"
            className="md:hidden p-1.5 rounded-xl bg-ukiyo-surface/80 text-ukiyo-gold border border-ukiyo-foam/15 touch-manipulation active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 音效開關切換 */}
        <button
          onClick={handleToggleMute}
          title={muted ? "開啟音效" : "靜音"}
          className="p-1.5 rounded-xl bg-ukiyo-surface/80 hover:bg-ukiyo-surface text-ukiyo-gold border border-ukiyo-foam/15 transition-colors cursor-pointer touch-manipulation active:scale-95"
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-ukiyo-mist" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* 人數席位 */}
        <div className="flex items-center space-x-1 text-ukiyo-foam bg-ukiyo-bg/80 px-2.5 py-1 rounded-full border border-ukiyo-foam/15 shadow-inner">
          <Users className="w-3 h-3 text-ukiyo-gold" />
          <span className="font-sans text-[11px] sm:text-xs font-semibold">{`${connectedCount}/${maxPlayers}`} 人席</span>
        </div>

        {/* 房主齒輪設定按鈕 */}
        {isHost && onOpenHostPanel && (
          <button
            onClick={onOpenHostPanel}
            title="房主設定"
            className="p-1.5 rounded-xl bg-ukiyo-surface hover:bg-ukiyo-wave text-ukiyo-foam border border-ukiyo-gold/40 transition-colors cursor-pointer touch-manipulation active:scale-95 shadow-md"
          >
            <Settings className="w-3.5 h-3.5 text-ukiyo-gold" />
          </button>
        )}
      </div>

      {/* 稱號修改 Modal 彈窗 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="✏️ 修改個人稱號"
      >
        <div className="space-y-4 font-serif text-center pt-1">
          <p className="text-xs text-ukiyo-mist">
            請輸入新的稱號，修改後將自動同步至牌席全場玩家。
          </p>

          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            maxLength={12}
            placeholder="請輸入新稱號..."
            className="w-full bg-ukiyo-bg border border-ukiyo-foam/20 rounded-xl px-4 py-2.5 text-center text-sm font-serif text-ukiyo-foam focus:outline-none focus:border-ukiyo-gold"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs"
            >
              取消
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!tempName.trim()}
              onClick={handleSaveName}
              className="text-xs font-bold tracking-widest"
            >
              儲存稱號
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
