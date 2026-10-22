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
    <div className="w-full bg-[#12161f] border border-slate-700 rounded-xl px-3 py-1.5 my-1 flex items-center justify-between gap-2 shadow-lg relative z-20">
      {/* 左側：離開按鈕 + 房間代碼 + 暱稱 */}
      <div className="flex items-center space-x-2">
        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            title="離開房間"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">離房</span>
          </button>
        )}

        {/* 房間代碼 */}
        <button
          onClick={handleCopyLink}
          title="點擊複製邀請連結"
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-600 cursor-pointer transition-colors active:scale-95"
        >
          <span className="text-xs sm:text-sm font-bold text-white tracking-wider font-mono">{roomId}</span>
          <span className="text-slate-400">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </span>
        </button>

        {/* 暱稱修改 */}
        {playerName && onChangePlayerName && (
          <button
            onClick={() => {
              setTempName(playerName);
              setIsEditModalOpen(true);
            }}
            title="點擊修改暱稱"
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <span className="font-bold truncate max-w-[100px] text-[#f59e0b]">{playerName}</span>
            <Edit3 className="w-3 h-3 text-[#f59e0b]" />
          </button>
        )}
      </div>

      {/* 右側：音效 + 連線數 + 房主設定 */}
      <div className="flex items-center space-x-2 text-xs">
        {playerName && onChangePlayerName && (
          <button
            onClick={() => {
              setTempName(playerName);
              setIsEditModalOpen(true);
            }}
            title="修改暱稱"
            className="md:hidden p-1.5 bg-slate-800 text-[#f59e0b] rounded-lg border border-slate-700 active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 音效開關 */}
        <button
          onClick={handleToggleMute}
          title={muted ? "開啟音效" : "靜音"}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer active:scale-95"
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-[#f59e0b]" />}
        </button>

        {/* 人數席位 */}
        <div className="flex items-center space-x-1 text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
          <Users className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="text-[11px] sm:text-xs">{`${connectedCount}/${maxPlayers}`} 人席</span>
        </div>

        {/* 房主設定按鈕 */}
        {isHost && onOpenHostPanel && (
          <button
            onClick={onOpenHostPanel}
            title="房主規則設定"
            className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-[#f59e0b] rounded-lg border border-[#f59e0b]/50 cursor-pointer active:scale-95"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 稱號修改 Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="修改稱號"
      >
        <div className="space-y-4 text-center pt-1">
          <p className="text-xs text-slate-400">
            請輸入新的稱號，修改後將自動同步給全場玩家。
          </p>

          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            maxLength={14}
            placeholder="請輸入暱稱..."
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-center text-sm text-white focus:outline-none focus:border-[#f59e0b]"
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
              className="text-xs font-bold"
            >
              儲存稱號
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
