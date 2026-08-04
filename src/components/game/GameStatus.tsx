"use client";

import React, { useState } from "react";
import { Users, Copy, Check, Settings, Edit3 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface GameStatusProps {
  roomId: string;
  connectedCount: number;
  maxPlayers: number;
  playerName?: string;
  isHost?: boolean;
  onOpenHostPanel?: () => void;
  onChangePlayerName?: (newName: string) => void;
}

export function GameStatus({
  roomId,
  connectedCount,
  maxPlayers,
  playerName = "",
  isHost = false,
  onOpenHostPanel,
  onChangePlayerName,
}: GameStatusProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(playerName);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("複製房間網址失敗:", error);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim() && onChangePlayerName) {
      onChangePlayerName(tempName.trim());
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl px-3 md:px-4 py-2.5 mb-2 flex items-center justify-between gap-2 border-ukiyo-foam/15 shadow-lg">
      {/* 左側：房間代碼、一鍵複製與個人稱號 */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 bg-ukiyo-surface/80 px-2.5 py-1 rounded-lg border border-ukiyo-foam/15">
          <span className="text-sm md:text-base font-bold text-ukiyo-gold font-mono">{roomId}</span>
          <button
            onClick={handleCopyLink}
            title="複製邀請連結"
            className="text-ukiyo-mist hover:text-ukiyo-foam transition-colors p-0.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 稱號顯示與修改按鈕 */}
        {playerName && onChangePlayerName && (
          <button
            onClick={() => {
              setTempName(playerName);
              setIsEditModalOpen(true);
            }}
            title="修改個人稱號"
            className="hidden sm:flex items-center gap-1 text-xs text-ukiyo-foam/90 bg-ukiyo-surface/60 hover:bg-ukiyo-surface px-2.5 py-1 rounded-lg border border-ukiyo-foam/10 transition-all cursor-pointer font-serif"
          >
            <span className="font-bold truncate max-w-[90px]">{playerName}</span>
            <Edit3 className="w-3 h-3 text-ukiyo-gold" />
          </button>
        )}
      </div>

      {/* 右側：人數與房主 ⚙ 按鈕 */}
      <div className="flex items-center space-x-2 md:space-x-3 text-xs font-serif">
        {/* 手機端獨立顯示稱號修改圖示 */}
        {playerName && onChangePlayerName && (
          <button
            onClick={() => {
              setTempName(playerName);
              setIsEditModalOpen(true);
            }}
            title="修改個人稱號"
            className="sm:hidden p-1.5 rounded-lg bg-ukiyo-surface/80 hover:bg-ukiyo-surface text-ukiyo-gold border border-ukiyo-foam/10 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 人數 */}
        <div className="flex items-center space-x-1 text-ukiyo-foam bg-ukiyo-surface/80 px-2.5 py-1 rounded-full border border-ukiyo-foam/10">
          <Users className="w-3.5 h-3.5 text-ukiyo-gold" />
          <span className="font-sans text-xs font-semibold">{`${connectedCount}/${maxPlayers}`} 人席</span>
        </div>

        {/* 房主齒輪設定按鈕 */}
        {isHost && onOpenHostPanel && (
          <button
            onClick={onOpenHostPanel}
            title="房主設定"
            className="p-1.5 rounded-lg bg-ukiyo-surface hover:bg-ukiyo-wave text-ukiyo-foam border border-ukiyo-gold/40 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-ukiyo-gold" />
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
            placeholder="請輸入新暱稱..."
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
