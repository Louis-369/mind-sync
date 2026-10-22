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
    <div className="w-full bg-[#030609]/95 border border-[#00ff9d]/50 px-2 sm:px-3 py-1 my-1 flex items-center justify-between gap-2 font-mono shadow-[0_0_15px_rgba(0,0,0,0.8)] relative z-20">
      {/* 左側：離席 + 頻道代碼 + 特工 ID */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            title="終止連線"
            className="flex items-center gap-1 text-[11px] text-[#00ff9d]/70 hover:text-[#00ff9d] bg-black/60 hover:bg-[#00ff9d]/20 px-2 py-0.5 border border-[#00ff9d]/40 transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">[EXIT]</span>
          </button>
        )}

        {/* 頻道金鑰 */}
        <button
          onClick={handleCopyLink}
          title="複製連線頻率網址"
          className="flex items-center space-x-1.5 bg-[#04080e] hover:bg-[#00e5ff]/20 px-2 py-0.5 border border-[#00e5ff]/60 cursor-pointer transition-colors active:scale-95"
        >
          <span className="text-xs font-bold text-[#00e5ff] tracking-wider">{roomId}</span>
          <span className="text-[#00e5ff]">
            {copied ? <Check className="w-3.5 h-3.5 text-[#00ff9d]" /> : <Copy className="w-3.5 h-3.5" />}
          </span>
        </button>

        {/* 特工代號修改 */}
        {playerName && onChangePlayerName && (
          <button
            onClick={() => {
              setTempName(playerName);
              setIsEditModalOpen(true);
            }}
            title="修改特工代號"
            className="hidden md:flex items-center gap-1 text-xs text-[#00ff9d] bg-black/60 hover:bg-[#00ff9d]/20 px-2 py-0.5 border border-[#00ff9d]/40 transition-all cursor-pointer active:scale-95"
          >
            <span className="font-bold truncate max-w-[100px]">ID: {playerName}</span>
            <Edit3 className="w-3 h-3 text-[#00ff9d]" />
          </button>
        )}
      </div>

      {/* 右側：音效 + 連線數 + 房主設定 */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs">
        {playerName && onChangePlayerName && (
          <button
            onClick={() => {
              setTempName(playerName);
              setIsEditModalOpen(true);
            }}
            title="修改特工代號"
            className="md:hidden p-1 bg-black/60 text-[#00ff9d] border border-[#00ff9d]/40 active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 音效開關 */}
        <button
          onClick={handleToggleMute}
          title={muted ? "開啟合成音效" : "靜音"}
          className="p-1 bg-black/60 hover:bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 transition-colors cursor-pointer active:scale-95"
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-[#00ff9d]/40" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* 特工在線席位 */}
        <div className="flex items-center space-x-1 text-[#00ff9d] bg-black/80 px-2 py-0.5 border border-[#00ff9d]/40">
          <Users className="w-3 h-3 text-[#00e5ff]" />
          <span className="text-[11px] font-bold">{`${connectedCount}/${maxPlayers}`} NODES</span>
        </div>

        {/* ROOT 權限設定 */}
        {isHost && onOpenHostPanel && (
          <button
            onClick={onOpenHostPanel}
            title="ROOT 系統規則設定"
            className="p-1 bg-[#ffb000]/15 hover:bg-[#ffb000]/30 text-[#ffb000] border border-[#ffb000]/70 cursor-pointer active:scale-95"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 特工代號修改 Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="SYS://RENAME_OPERATOR"
      >
        <div className="space-y-4 font-mono text-center pt-1">
          <p className="text-xs text-[#00ff9d]/70">
            請輸入新的特工代號 (OPERATOR_ID)，將同步廣播至全節點。
          </p>

          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            maxLength={14}
            placeholder="OPERATOR_NAME..."
            className="w-full bg-[#030609] border-2 border-[#00ff9d] px-3 py-2 text-center text-sm font-mono text-[#00ff9d] focus:outline-none focus:shadow-[0_0_15px_#00ff9d]"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs font-mono"
            >
              [ABORT]
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!tempName.trim()}
              onClick={handleSaveName}
              className="text-xs font-mono font-bold"
            >
              [SAVE_ID]
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
