"use client";

import React, { useEffect, useRef } from "react";

interface WaveCanvasProps {
  active?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export function AsciiWaveCanvas({ active = true }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const spacing = 28; // 圓點間距

    const ripples: Ripple[] = [];
    const spectrumColors = ["#0ea5e9", "#10b981", "#f59e0b", "#f97316"];
    let colorIdx = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      if (Math.random() > 0.4) {
        ripples.push({
          x: clientX,
          y: clientY,
          radius: 4,
          maxRadius: 60,
          color: spectrumColors[colorIdx % spectrumColors.length],
          alpha: 0.45,
        });
        colorIdx++;
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      for (let i = 0; i < 2; i++) {
        ripples.push({
          x: clientX,
          y: clientY,
          radius: 6 + i * 15,
          maxRadius: 100 + i * 30,
          color: spectrumColors[(colorIdx + i) % spectrumColors.length],
          alpha: 0.6,
        });
      }
      colorIdx += 2;
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. 更新漣漪
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.2;
        r.alpha *= 0.94;
        if (r.alpha < 0.02 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 2. 繪製精緻規律的暖米色點陣 (Dot Grid)
      ctx.save();
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          let dotRadius = 1.3;
          let dotColor = "#e5dfd3";

          // 計算是否被漣漪波及
          for (const rip of ripples) {
            const dx = x - rip.x;
            const dy = y - rip.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const diff = Math.abs(dist - rip.radius);
            if (diff < 20) {
              const strength = (1 - diff / 20) * rip.alpha;
              dotRadius = Math.max(dotRadius, 1.3 + strength * 3.5);
              dotColor = rip.color;
            }
          }

          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ touchAction: "none" }}
    />
  );
}
