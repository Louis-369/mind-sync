"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalJSX = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="bg-[#141f2d] border border-[rgba(201,169,110,0.4)] rounded-2xl max-w-md w-full shadow-[0_15px_40px_rgba(0,0,0,0.7)] overflow-hidden my-auto text-[#e8dcc8]">
        {/* 頂部標題列 */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f1722] border-b border-[rgba(201,169,110,0.25)]">
          <h3 className="text-base font-bold text-[#f5f0e3] tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c9a96e]" />
            {title}
          </h3>
          <button
            onClick={onClose}
            title="關閉"
            className="w-7 h-7 rounded-lg bg-[#1b2838] border border-[rgba(201,169,110,0.3)] flex items-center justify-center text-[#8a9bb0] hover:text-[#f5f0e3] hover:bg-[#25374d] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 內容區 */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
