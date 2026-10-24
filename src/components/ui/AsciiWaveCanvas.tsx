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
    const spacing = 32;

    const ripples: Ripple[] = [];
    const colors = ["#c9a96e", "#38bdf8", "#e8dcc8", "#c73e1d"];
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

      if (Math.random() > 0.45) {
        ripples.push({
          x: clientX,
          y: clientY,
          radius: 4,
          maxRadius: 70,
          color: colors[colorIdx % colors.length],
          alpha: 0.5,
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
          radius: 8 + i * 16,
          maxRadius: 110 + i * 35,
          color: colors[(colorIdx + i) % colors.length],
          alpha: 0.65,
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
        r.radius += 2.0;
        r.alpha *= 0.94;
        if (r.alpha < 0.02 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 2. 繪製低調和風微粒矩陣
      ctx.save();
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          let dotRadius = 1.2;
          let dotColor = "rgba(45, 90, 123, 0.28)";

          for (const rip of ripples) {
            const dx = x - rip.x;
            const dy = y - rip.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const diff = Math.abs(dist - rip.radius);
            if (diff < 22) {
              const strength = (1 - diff / 22) * rip.alpha;
              dotRadius = Math.max(dotRadius, 1.2 + strength * 3.8);
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
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
      style={{ touchAction: "none" }}
    />
  );
}
