
import React from "react";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "tertiary";
  animate?: boolean;
}

export function GradientBackground({
  className,
  variant = "primary",
  animate = true,
  children,
  ...props
}: GradientBackgroundProps) {
  const variants = {
    primary: "from-blue-500/30 via-purple-500/30 to-pink-500/30",
    secondary: "from-emerald-500/30 via-teal-500/30 to-blue-500/30",
    tertiary: "from-orange-500/30 via-red-500/30 to-purple-500/30"
  };

  return (
    <div className="relative w-full overflow-hidden" {...props}>
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={cn(
            "absolute -inset-[10px] opacity-50 blur-3xl bg-gradient-to-r",
            variants[variant],
            animate && "animate-pulse-slow",
            className
          )}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
