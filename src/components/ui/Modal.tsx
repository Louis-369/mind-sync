"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto font-mono">
      <div className="bg-[#030609] border-2 border-[#00ff9d] w-full max-w-md p-5 shadow-[0_0_25px_rgba(0,255,157,0.3)] relative my-auto max-h-[90vh] overflow-y-auto">
        {/* 四角錨點 */}
        <div className="absolute top-1 left-1.5 text-[8px] text-[#00ff9d]">+</div>
        <div className="absolute top-1 right-1.5 text-[8px] text-[#00ff9d]">+</div>
        <div className="absolute bottom-1 left-1.5 text-[8px] text-[#00ff9d]">+</div>
        <div className="absolute bottom-1 right-1.5 text-[8px] text-[#00ff9d]">+</div>

        <div className="flex items-center justify-between pb-2 border-b border-[#00ff9d]/30 mb-3">
          <h3 className="text-sm md:text-base font-bold text-[#00ff9d] tracking-wider flex items-center gap-2">
            &gt; {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#00ff9d]/70 hover:text-[#00ff9d] p-0.5 hover:bg-[#00ff9d]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
