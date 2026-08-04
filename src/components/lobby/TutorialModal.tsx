"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, HeartHandshake, Layers, Eye } from "lucide-react";
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
      title: "第一步：設定主題與價值交流",
      icon: <HeartHandshake className="w-8 h-8 text-ukiyo-gold" />,
      subtitle: "不透露實際數字，分享彼此的真實想法",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3 bg-ukiyo-surface/80 rounded-xl border border-ukiyo-gold/20 text-xs text-ukiyo-mist space-y-2">
            <p className="font-bold text-ukiyo-foam flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ukiyo-gold" /> 核心精神：
            </p>
            <p>
              選定一個有趣主題（例如：「出國最想去的地方」、「買過最瞎的東西」）。大家在不直接說出 1~100 數字的前提下，自由討論並各自在心中給出衡量點數。
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "第二步：價值轉化與默契落牌",
      icon: <Layers className="w-8 h-8 text-ukiyo-gold" />,
      subtitle: "由左至右，將手牌放入檯面槽位",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3 bg-ukiyo-surface/80 rounded-xl border border-ukiyo-gold/20 text-xs text-ukiyo-mist space-y-2">
            <p className="font-bold text-ukiyo-foam flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ukiyo-gold" /> 出牌方式：
            </p>
            <p>
              將你的衡量標準轉化為手上的卡牌數字。憑藉與同伴的默契，點選盤面上的空席位（<span className="text-ukiyo-gold font-bold">壹、貳、參...</span>），將卡牌由左至右放置到檯面。
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "第三步：蓋牌同意與揭牌驗證",
      icon: <Eye className="w-8 h-8 text-ukiyo-gold" />,
      subtitle: "全體鎖定蓋上朱印，翻開驗證共鳴",
      content: (
        <div className="space-y-3 text-left">
          <div className="p-3 bg-ukiyo-surface/80 rounded-xl border border-ukiyo-gold/20 text-xs text-ukiyo-mist space-y-2">
            <p className="font-bold text-ukiyo-foam flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ukiyo-gold" /> 勝負條件：
            </p>
            <p>
              出完手牌後點擊「同意鎖定」，卡牌會蓋上日式朱紅「確」字落款。全員鎖定後進入翻牌階段，只要卡牌數字<span className="text-ukiyo-gold font-bold">由左至右完美遞增</span>，即代表默契勝利！
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
    <Modal isOpen={isOpen} onClose={onClose} title="🌸 心天秤 ‧ 遊戲玩法教學">
      <div className="space-y-5 font-serif text-center pt-1">
        {/* 步驟指示點 */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentStep === idx
                  ? "w-8 bg-ukiyo-gold"
                  : "w-2 bg-ukiyo-foam/30 hover:bg-ukiyo-foam/50"
              }`}
            />
          ))}
        </div>

        {/* 步驟標題與圖示 */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-ukiyo-gold/10 rounded-2xl border border-ukiyo-gold/30">
            {steps[currentStep].icon}
          </div>
          <h3 className="text-base font-bold text-ukiyo-foam">
            {steps[currentStep].title}
          </h3>
          <p className="text-xs text-ukiyo-gold/90">
            {steps[currentStep].subtitle}
          </p>
        </div>

        {/* 步驟圖文內容 */}
        {steps[currentStep].content}

        {/* 底部導覽按鈕 */}
        <div className="flex items-center justify-between pt-2 border-t border-ukiyo-foam/10">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentStep === 0}
            onClick={handlePrev}
            className="gap-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 上一步
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            className="gap-1 text-xs tracking-widest font-bold"
          >
            {currentStep === steps.length - 1 ? (
              <span className="flex items-center gap-1">
                開始遊玩 <CheckCircle2 className="w-3.5 h-3.5 text-ukiyo-gold" />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                下一步 <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
