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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className="bg-[#12161f] border border-slate-700 rounded-xl w-full max-w-md p-5 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto text-white">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
          <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
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
