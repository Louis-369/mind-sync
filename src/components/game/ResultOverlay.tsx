"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";

interface ResultOverlayProps {
  result: "win" | "lose" | null;
  isHost: boolean;
  onRestart: () => void;
}

export function ResultOverlay({ result, isHost, onRestart }: ResultOverlayProps) {
  if (!result) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-auto flex items-center justify-center max-w-[92vw] text-center">
      {isHost ? (
        <Button
          variant="primary"
          size="md"
          onClick={onRestart}
          className="text-xs md:text-sm font-serif font-bold flex items-center justify-center gap-2 py-2.5 px-6 shadow-2xl tracking-widest text-center"
        >
          <RotateCcw className="w-4 h-4" /> 房主重新開局
        </Button>
      ) : (
        <div className="bg-ukiyo-surface/95 text-ukiyo-mist border border-ukiyo-foam/20 shadow-2xl px-5 py-2.5 rounded-2xl backdrop-blur-md text-xs font-serif flex items-center justify-center gap-2 text-center">
          <span className="w-2 h-2 rounded-full bg-ukiyo-gold animate-ping" />
          <span>靜候房主重新開局...</span>
        </div>
      )}
    </div>
  );
}
