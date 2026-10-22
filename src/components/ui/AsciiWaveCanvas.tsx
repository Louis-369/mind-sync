"use client";

import React, { useEffect, useRef } from "react";

// ASCII 密度梯度 (由淺入深，加入和風「心、秤」高能量字符)
const ASCII_RAMP = " ·:-=+*#%@心秤";

interface AsciiWaveCanvasProps {
  active?: boolean;
}

export function AsciiWaveCanvas({ active = true }: AsciiWaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // 滑鼠游標與漣漪追蹤
    const ripples: { x: number; y: number; radius: number; maxRadius: number; strength: number }[] = [];
    const mouse = { x: -1000, y: -1000, lastX: -1000, lastY: -1000, speed: 0 };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.lastX;
      const dy = e.clientY - mouse.lastY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;

      // 當快速移動滑鼠時產生字符水波漣漪
      if (mouse.speed > 8) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          maxRadius: 110,
          strength: Math.min(1.0, mouse.speed / 40),
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // 點擊觸發全螢幕擴散 ASCII 衝擊波
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.8,
        strength: 1.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("pointerdown", handlePointerDown);

    // 字符網格大小
    const cellWidth = 14;
    const cellHeight = 18;
    let time = 0;

    const render = () => {
      time += 0.025;

      // 清空為深邃賽博黑底
      ctx.fillStyle = "#05080f";
      ctx.fillRect(0, 0, width, height);

      // 更新漣漪狀態
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 5.5;
        rip.strength *= 0.94;
        if (rip.strength < 0.02 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      ctx.font = '13px "Courier New", Courier, monospace';
      ctx.textBaseline = "top";

      const cols = Math.ceil(width / cellWidth);
      const rows = Math.ceil(height / cellHeight);

      // 遍歷滿版 ASCII 網格
      for (let r = 0; r < rows; r++) {
        const y = r * cellHeight;
        for (let c = 0; c < cols; c++) {
          const x = c * cellWidth;

          // 基礎正弦雙波 (模擬浮世繪大浪翻湧與天秤律動)
          const wave1 = Math.sin(c * 0.08 + time * 0.8 + r * 0.05);
          const wave2 = Math.cos(r * 0.12 - time * 0.6 + c * 0.03);
          const diagonalWave = Math.sin((c + r) * 0.06 - time * 0.9);
          let energy = (wave1 + wave2 + diagonalWave + 3) / 6; // 0 ~ 1 基礎能量

          // 滑鼠游標靠近激發
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          if (distToMouse < 120) {
            const proximity = 1 - distToMouse / 120;
            energy += proximity * 0.65;
          }

          // 漣漪能量疊加
          for (let k = 0; k < ripples.length; k++) {
            const rip = ripples[k];
            const distToRip = Math.hypot(x - rip.x, y - rip.y);
            const diff = Math.abs(distToRip - rip.radius);
            if (diff < 32) {
              const ripIntensity = (1 - diff / 32) * rip.strength;
              energy += ripIntensity * 0.85;
            }
          }

          energy = Math.max(0, Math.min(0.999, energy));

          // 挑選對應字符
          const charIndex = Math.floor(energy * ASCII_RAMP.length);
          const char = ASCII_RAMP[charIndex];

          if (char === " ") continue;

          // 根據能量決定顏色：低能量暗藍青，高能量亮金 / 琥珀
          if (energy > 0.72) {
            ctx.fillStyle = "#ffdf79"; // 高能亮金
          } else if (energy > 0.45) {
            ctx.fillStyle = "#c9a96e"; // 琥珀和風金
          } else if (energy > 0.25) {
            ctx.fillStyle = "#3b7a9e"; // 浮世繪波濤藍
          } else {
            ctx.fillStyle = "#1e374b"; // 深邃低頻藍灰
          }

          ctx.fillText(char, x, y);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 select-none opacity-85 mix-blend-screen"
      style={{ filter: "contrast(1.15) brightness(1.1)" }}
    />
  );
}
