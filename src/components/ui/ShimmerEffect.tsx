"use client";

import type { ReactNode } from "react";

interface ShimmerEffectProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerEffect({ children, className = "" }: ShimmerEffectProps) {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      {children}
      <div
        className="absolute inset-0 -translate-x-full rotate-[-15deg] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[200%] transition-transform duration-[600ms] ease-in-out pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
