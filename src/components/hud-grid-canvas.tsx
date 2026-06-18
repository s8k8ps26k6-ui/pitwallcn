"use client";

import { useEffect, useRef } from "react";

const GRID_SIZE = 48;
const MAX_PARALLAX = 12;

export function HudGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrameId = 0;
    let previousTime = performance.now();
    let scanPosition = 0;
    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(bounds.width, 1);
      height = Math.max(bounds.height, 1);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const normalizedX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      const normalizedY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;

      targetOffsetX = normalizedX * MAX_PARALLAX * 2;
      targetOffsetY = normalizedY * MAX_PARALLAX * 2;
    };

    const handlePointerLeave = () => {
      targetOffsetX = 0;
      targetOffsetY = 0;
    };

    const draw = (time: number) => {
      const delta = Math.min(time - previousTime, 40);
      previousTime = time;
      scanPosition = (scanPosition + delta * 0.055) % (height + 96);
      offsetX += (targetOffsetX - offsetX) * 0.075;
      offsetY += (targetOffsetY - offsetY) * 0.075;

      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(offsetX, offsetY);
      context.strokeStyle = "rgba(255,0,0,0.06)";
      context.lineWidth = 1;
      context.beginPath();

      const horizontalStart = -GRID_SIZE + (offsetY % GRID_SIZE);
      const verticalStart = -GRID_SIZE + (offsetX % GRID_SIZE);

      for (let x = verticalStart; x <= width + GRID_SIZE; x += GRID_SIZE) {
        context.moveTo(x, -GRID_SIZE);
        context.lineTo(x, height + GRID_SIZE);
      }

      for (let y = horizontalStart; y <= height + GRID_SIZE; y += GRID_SIZE) {
        context.moveTo(-GRID_SIZE, y);
        context.lineTo(width + GRID_SIZE, y);
      }

      context.stroke();
      context.restore();

      const scanY = scanPosition - 48;
      const gradient = context.createLinearGradient(0, scanY - 24, 0, scanY + 24);
      gradient.addColorStop(0, "rgba(255,0,0,0)");
      gradient.addColorStop(0.5, "rgba(255,0,0,0.15)");
      gradient.addColorStop(1, "rgba(255,0,0,0)");
      context.fillStyle = gradient;
      context.fillRect(0, scanY - 24, width, 48);

      canvas.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      animationFrameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)] will-change-transform"
      aria-hidden="true"
    />
  );
}
