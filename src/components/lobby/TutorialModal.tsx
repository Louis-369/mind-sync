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
      title: "① 看題目，用形容詞聊手牌",
      icon: <Sparkles className="w-8 h-8 text-[#f59e0b]" />,
      subtitle: "不能直接說出數字，只能用情境描述你的感受",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-2 leading-relaxed">
            <p className="font-bold text-[#f59e0b]">基本規則：</p>
            <p>
              每局會有一道題目（例如：「收到最想翻白眼的交換禮物」）。每個人會拿到 1~100 的數字牌，請用言語形容你手中數字的大小程度，但<span className="text-white font-bold">絕對不能直接說出數字</span>！
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "② 憑默契，由小到大出牌",
      icon: <Layers className="w-8 h-8 text-[#f59e0b]" />,
      subtitle: "聽大家的描述，從第 1 格往後由小到大排好",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-2 leading-relaxed">
            <p className="font-bold text-[#f59e0b]">怎麼出牌與收牌：</p>
            <p>
              點擊場上的格子（<span className="text-white font-bold">第 1 格、第 2 格...</span>）再點擊手牌就能出牌。目標是讓全場的牌**由小到大排好**。如果跟別人撞在同一格，點一下場上的牌就能收回重放！
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "③ 翻開檢查，順序全對就贏！",
      icon: <Eye className="w-8 h-8 text-[#f59e0b]" />,
      subtitle: "所有人確認鎖定後翻牌，數字由小到大即過關",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-2 leading-relaxed">
            <p className="font-bold text-[#f59e0b]">怎麼贏：</p>
            <p>
              大家把牌出完並按下「確認鎖定」後，就可以開始翻牌。只要翻開後所有數字<span className="text-emerald-400 font-bold">從第 1 格到最後一格都是由小到大</span>，全員就挑戰成功！
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
    <Modal isOpen={isOpen} onClose={onClose} title="30 秒玩法說明">
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
                <CheckCircle2 className="w-3.5 h-3.5 text-black" /> 懂了，開始玩！
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
