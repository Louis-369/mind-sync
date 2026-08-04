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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ukiyo-bg/90 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="glass-panel w-full max-w-md rounded-2xl p-5 md:p-6 border border-ukiyo-foam/20 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-ukiyo-foam/15 mb-4">
          <h3 className="text-base md:text-lg font-serif font-bold text-ukiyo-foam tracking-wide flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-ukiyo-mist hover:text-ukiyo-foam p-1 rounded-lg hover:bg-ukiyo-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
