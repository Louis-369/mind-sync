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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className="bg-[#ffffff] border-2 border-[#18181b] rounded-2xl max-w-md w-full shadow-[6px_6px_0px_#18181b] overflow-hidden my-auto">
        {/* 頂部標題列 */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#f4f1ea] border-b-2 border-[#18181b]">
          <h3 className="text-base font-black text-[#18181b] tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            title="關閉"
            className="w-7 h-7 rounded-lg bg-[#ffffff] border-2 border-[#18181b] flex items-center justify-center text-[#18181b] hover:bg-[#fee2e2] transition-colors shadow-[2px_2px_0px_#18181b] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 內容區 */}
        <div className="p-5 text-[#18181b]">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
