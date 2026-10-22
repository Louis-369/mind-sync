"use client";

import React, { useState } from "react";
import { Terminal, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Cpu, Eye } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      title: "01 // BENCHMARK PROTOCOL [基準測試]",
      icon: <Cpu className="w-8 h-8 text-[#00ff9d]" />,
      subtitle: "禁言絕對數字，純粹透過語意訊號溝通頻率",
      content: (
        <div className="space-y-3 text-left font-mono">
          <div className="p-3 bg-[#04080e] border border-[#00ff9d]/30 text-xs text-[#00ff9d]/80 space-y-2">
            <p className="font-bold text-[#00e5ff] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> 核心通訊規則：
            </p>
            <p>
              系統會發布一組情境基準測試（例如：「收到最想翻白眼的交換禮物」）。特工在不直接透露 001~100 數值的前提下，自由討論並各自在心中評定信號強度。
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "02 // PACKET ALLOCATION [封包調度]",
      icon: <Terminal className="w-8 h-8 text-[#00ff9d]" />,
      subtitle: "由左至右 [0x01..]，將加密卡匣落入記憶體節點",
      content: (
        <div className="space-y-3 text-left font-mono">
          <div className="p-3 bg-[#04080e] border border-[#00ff9d]/30 text-xs text-[#00ff9d]/80 space-y-2">
            <p className="font-bold text-[#00e5ff] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> 節點插槽機制：
            </p>
            <p>
              將你評定的信號強度轉化為手中的卡匣。憑藉與同伴的直覺默契，點擊盤面槽位（<span className="text-[#00ff9d] font-bold">NODE_0x01, 0x02...</span>），依頻率由低到高排序。若發生撞席，請積極協商讓位！
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "03 // DECRYPT & SYNC [解密驗證]",
      icon: <Eye className="w-8 h-8 text-[#00ff9d]" />,
      subtitle: "全體特工提交鎖定，解密節點判定同步率",
      content: (
        <div className="space-y-3 text-left font-mono">
          <div className="p-3 bg-[#04080e] border border-[#00ff9d]/30 text-xs text-[#00ff9d]/80 space-y-2">
            <p className="font-bold text-[#00e5ff] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> 判定條件：
            </p>
            <p>
              卡匣派發完畢後點擊「COMMIT_SYNC」提交鎖定。全員鎖定後進入解密階段，可從最有把握的節點開始揭牌。只要所有封包數值<span className="text-[#00ff9d] font-bold">由左至右嚴格遞增</span>，即達成 100% 神經頻率同步成功！
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SYS://PROTOCOL_MANUAL">
      <div className="space-y-4 font-mono text-center">
        <div className="flex justify-center my-1">{steps[currentStep].icon}</div>

        <div>
          <h4 className="text-sm font-bold text-[#00ff9d] mb-1">
            {steps[currentStep].title}
          </h4>
          <p className="text-[11px] text-[#00e5ff]">
            {steps[currentStep].subtitle}
          </p>
        </div>

        <div>{steps[currentStep].content}</div>

        {/* 步驟指示器 */}
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 transition-all ${
                idx === currentStep ? "w-6 bg-[#00ff9d]" : "w-1.5 bg-[#00ff9d]/30"
              }`}
            />
          ))}
        </div>

        {/* 導航按鈕列 */}
        <div className="flex items-center justify-between pt-2 border-t border-[#00ff9d]/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> [PREV]
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            className="text-xs font-bold"
          >
            {currentStep === steps.length - 1 ? (
              <span className="flex items-center gap-1 text-black">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" /> [INITIALIZE]
              </span>
            ) : (
              <span className="flex items-center gap-1 text-black">
                [NEXT] <ArrowRight className="w-3.5 h-3.5 text-black" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
