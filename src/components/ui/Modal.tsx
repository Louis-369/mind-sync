"use client";

import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ukiyo-bg/85 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="glass-panel w-full max-w-md rounded-2xl p-5 md:p-6 border border-ukiyo-foam/20 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-ukiyo-foam/15 mb-4">
          <h3 className="text-base md:text-lg font-serif font-bold text-ukiyo-foam tracking-wide flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-ukiyo-mist hover:text-ukiyo-foam p-1 rounded-lg hover:bg-ukiyo-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
