"use client";

import React, { useEffect, useRef } from "react";

// 純血賽博終端 ASCII 密度表 (從空格到最密集的 @, #, 8, 0)
const CYBER_ASCII_RAMP = " .:-=+*#%@018#&";

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

      if (mouse.speed > 6) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 12,
          maxRadius: 130,
          strength: Math.min(1.0, mouse.speed / 35),
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.9,
        strength: 1.8,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("pointerdown", handlePointerDown);

    const cellWidth = 14;
    const cellHeight = 18;
    let time = 0;

    const render = () => {
      time += 0.028;

      // 純黑背景
      ctx.fillStyle = "#030609";
      ctx.fillRect(0, 0, width, height);

      // 更新漣漪
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 6.0;
        rip.strength *= 0.93;
        if (rip.strength < 0.02 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      ctx.font = '13px "JetBrains Mono", "Courier New", monospace';
      ctx.textBaseline = "top";

      const cols = Math.ceil(width / cellWidth);
      const rows = Math.ceil(height / cellHeight);

      for (let r = 0; r < rows; r++) {
        const y = r * cellHeight;
        for (let c = 0; c < cols; c++) {
          const x = c * cellWidth;

          // 正弦波疊加
          const wave1 = Math.sin(c * 0.09 + time * 0.9 + r * 0.06);
          const wave2 = Math.cos(r * 0.14 - time * 0.7 + c * 0.04);
          const diagonalWave = Math.sin((c + r) * 0.07 - time * 1.1);
          let energy = (wave1 + wave2 + diagonalWave + 3) / 6;

          // 滑鼠游標激發
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          if (distToMouse < 130) {
            const proximity = 1 - distToMouse / 130;
            energy += proximity * 0.75;
          }

          // 漣漪激發
          for (let k = 0; k < ripples.length; k++) {
            const rip = ripples[k];
            const distToRip = Math.hypot(x - rip.x, y - rip.y);
            const diff = Math.abs(distToRip - rip.radius);
            if (diff < 36) {
              const ripIntensity = (1 - diff / 36) * rip.strength;
              energy += ripIntensity * 0.95;
            }
          }

          energy = Math.max(0, Math.min(0.999, energy));

          const charIndex = Math.floor(energy * CYBER_ASCII_RAMP.length);
          const char = CYBER_ASCII_RAMP[charIndex];

          if (char === " ") continue;

          // 賽博高對比螢光綠 / 青藍 / 炫白階梯
          if (energy > 0.82) {
            ctx.fillStyle = "#ffffff"; // 能量爆發白
          } else if (energy > 0.6) {
            ctx.fillStyle = "#00ff9d"; // 核心螢光綠
          } else if (energy > 0.38) {
            ctx.fillStyle = "#00e5ff"; // 賽博青
          } else {
            ctx.fillStyle = "#0a3a2a"; // 低頻深綠
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
      className="fixed inset-0 pointer-events-none z-0 select-none opacity-90"
      style={{ filter: "contrast(1.2) drop-shadow(0 0 4px rgba(0,255,157,0.3))" }}
    />
  );
}
