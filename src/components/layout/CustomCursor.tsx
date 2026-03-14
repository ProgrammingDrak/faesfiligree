"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  rotation: number;
}

let sparkleId = 0;

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const position = useRef({ x: 0, y: 0 });
  const sparkles = useRef<Sparkle[]>([]);
  const rafRef = useRef<number>(0);
  const lastSparkle = useRef(0);

  const animate = useCallback(() => {
    // Update cursor position directly (no lerp — tracks 1:1)
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
    }

    // Animate sparkle trail on canvas
    const canvas = trailRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw sparkles
        sparkles.current = sparkles.current.filter((s) => s.opacity > 0.01);
        for (const s of sparkles.current) {
          s.opacity *= 0.92;
          s.scale *= 0.96;
          s.rotation += 2;

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate((s.rotation * Math.PI) / 180);
          ctx.globalAlpha = s.opacity;

          // Draw a small 4-point star
          const size = 4 * s.scale;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.3, -size * 0.3);
          ctx.lineTo(size, 0);
          ctx.lineTo(size * 0.3, size * 0.3);
          ctx.lineTo(0, size);
          ctx.lineTo(-size * 0.3, size * 0.3);
          ctx.lineTo(-size, 0);
          ctx.lineTo(-size * 0.3, -size * 0.3);
          ctx.closePath();
          ctx.fillStyle = "#B87333";
          ctx.fill();

          ctx.restore();
        }
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Disable on touch devices
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) return;

    document.documentElement.classList.add("custom-cursor-active");

    // Size canvas to window
    const canvas = trailRef.current;
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      position.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering over a clickable element
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [role='button'], input, select, textarea, [tabindex]");
      setIsPointer(!!clickable);

      // Spawn sparkles along the trail
      const now = Date.now();
      if (now - lastSparkle.current > 40) {
        lastSparkle.current = now;
        sparkles.current.push({
          id: sparkleId++,
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          opacity: 0.6 + Math.random() * 0.4,
          scale: 0.5 + Math.random() * 0.8,
          rotation: Math.random() * 360,
        });
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, animate]);

  return (
    <>
      {/* Sparkle trail canvas */}
      <canvas
        ref={trailRef}
        className="fixed inset-0 pointer-events-none z-[9998] hidden md:block"
        aria-hidden="true"
      />

      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ opacity: isVisible ? 1 : 0 }}
        aria-hidden="true"
      >
        <svg
          width={isPointer ? 32 : 24}
          height={isPointer ? 32 : 24}
          viewBox="0 0 24 24"
          fill="none"
          className="transition-all duration-200"
          style={{
            filter: "drop-shadow(0 0 4px rgba(184, 115, 51, 0.5))",
          }}
        >
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="#B87333"
            stroke="#8B5A2B"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    </>
  );
}
