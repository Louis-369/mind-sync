"use client";

import React, { useEffect, useRef } from "react";

const ASCII_CHARS = " .:-=+*#%@";

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

      if (mouse.speed > 8) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 12,
          maxRadius: 130,
          strength: Math.min(1.0, mouse.speed / 40),
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.7,
        strength: 1.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("pointerdown", handlePointerDown);

    const cellWidth = 14;
    const cellHeight = 18;
    let time = 0;

    const render = () => {
      time += 0.02;

      // 護眼深黑底
      ctx.fillStyle = "#090b0e";
      ctx.fillRect(0, 0, width, height);

      // 更新漣漪
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 5.5;
        rip.strength *= 0.94;
        if (rip.strength < 0.02 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textBaseline = "top";

      const cols = Math.ceil(width / cellWidth);
      const rows = Math.ceil(height / cellHeight);

      for (let r = 0; r < rows; r++) {
        const y = r * cellHeight;
        for (let c = 0; c < cols; c++) {
          const x = c * cellWidth;

          const wave1 = Math.sin(c * 0.08 + time * 0.7 + r * 0.05);
          const wave2 = Math.cos(r * 0.12 - time * 0.5 + c * 0.03);
          let energy = (wave1 + wave2 + 2) / 4;

          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          if (distToMouse < 120) {
            const proximity = 1 - distToMouse / 120;
            energy += proximity * 0.7;
          }

          for (let k = 0; k < ripples.length; k++) {
            const rip = ripples[k];
            const distToRip = Math.hypot(x - rip.x, y - rip.y);
            const diff = Math.abs(distToRip - rip.radius);
            if (diff < 32) {
              const ripIntensity = (1 - diff / 32) * rip.strength;
              energy += ripIntensity * 0.8;
            }
          }

          energy = Math.max(0, Math.min(0.999, energy));

          const charIndex = Math.floor(energy * ASCII_CHARS.length);
          const char = ASCII_CHARS[charIndex];

          if (char === " ") continue;

          // 平時極為低調深藍灰，游標掠過時泛起溫潤金色/青色
          if (energy > 0.78) {
            ctx.fillStyle = "#fde68a"; // 亮金
          } else if (energy > 0.55) {
            ctx.fillStyle = "#f59e0b"; // 琥珀金
          } else if (energy > 0.35) {
            ctx.fillStyle = "#38bdf8"; // 柔和天藍
          } else {
            ctx.fillStyle = "#1e293b"; // 極暗低調深灰，絕不干擾閱讀
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
      className="fixed inset-0 pointer-events-none z-0 select-none opacity-80"
    />
  );
}
