
import React from "react";
import { cn } from "@/lib/utils";

interface GradientDotsBackgroundProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  dotOpacity?: number;
  children?: React.ReactNode;
}

export function GradientDotsBackground({
  className,
  dotColor = "rgb(107, 70, 193)",
  dotSize = 2,
  dotOpacity = 0.15,
  children,
}: GradientDotsBackgroundProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent 0)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0",
          opacity: dotOpacity,
        }}
      />
      
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/80 to-transparent backdrop-blur-[1px]" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
