"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Layers, Eye } from "lucide-react";
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
      title: "① 展卷抽題 ‧ 禁言數字",
      icon: <Sparkles className="w-8 h-8 text-[#f59e0b]" />,
      subtitle: "不能直接說出數字，只能用情境描述你的感受",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-2 leading-relaxed">
            <p className="font-bold text-[#f59e0b]">核心玩法規則：</p>
            <p>
              每局會有一道情境題（例如：「收到最想翻白眼的交換禮物」）。每位玩家會拿到 1~100 的數字手牌，請用言語形容你手中數字對應的事物，但<span className="text-white font-bold">絕對不能直接說出數字</span>！
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "② 暗出心證 ‧ 由小至大落席",
      icon: <Layers className="w-8 h-8 text-[#f59e0b]" />,
      subtitle: "憑藉彼此的描述與默契，由第 1 席往後依序排好",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-2 leading-relaxed">
            <p className="font-bold text-[#f59e0b]">自由搶位與讓席：</p>
            <p>
              點擊盤面的槽位（<span className="text-white font-bold">第 1 席、第 2 席...</span>）再點擊手牌即可出牌。目標是讓全場卡牌由左至右、由上至下**由小到大排列**。如果跟隊友撞在同一格，可以隨時點擊卡牌收回重放！
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "③ 翻牌共鳴 ‧ 心天秤平衡",
      icon: <Eye className="w-8 h-8 text-[#f59e0b]" />,
      subtitle: "全員確認鎖定後揭曉，完全遞增即獲勝！",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-2 leading-relaxed">
            <p className="font-bold text-[#f59e0b]">勝利條件：</p>
            <p>
              所有人出完手牌並點擊「確認鎖定」後，即可從全場最有把握的席位開始翻牌。只要翻開後所有數字<span className="text-emerald-400 font-bold">符合由小到大遞增</span>，即達成心天秤完美平衡！
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
    <Modal isOpen={isOpen} onClose={onClose} title="30 秒上手指南">
      <div className="space-y-4 text-center">
        <div className="flex justify-center my-1">{steps[currentStep].icon}</div>

        <div>
          <h4 className="text-base font-bold text-white mb-1">
            {steps[currentStep].title}
          </h4>
          <p className="text-xs text-slate-400">
            {steps[currentStep].subtitle}
          </p>
        </div>

        <div>{steps[currentStep].content}</div>

        {/* 步驟指示器 */}
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? "w-6 bg-[#f59e0b]" : "w-1.5 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* 導航按鈕列 */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> 上一步
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            className="text-xs font-bold"
          >
            {currentStep === steps.length - 1 ? (
              <span className="flex items-center gap-1 text-black">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" /> 準備好了！
              </span>
            ) : (
              <span className="flex items-center gap-1 text-black">
                下一步 <ArrowRight className="w-3.5 h-3.5 text-black" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
