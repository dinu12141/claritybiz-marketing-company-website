import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

/**
 * Lightweight animated particles for dark hero/CTA sections.
 * Purely decorative; disabled by prefers-reduced-motion in CSS.
 */
export function Particles({ count = 18, className }: { count?: number; className?: string }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rand = (n: number) => ((seed * (n + 1)) % 1000) / 1000;
    return {
      left: `${rand(1) * 100}%`,
      top: `${40 + rand(2) * 60}%`,
      size: 2 + Math.round(rand(3) * 3),
      dur: `${12 + rand(4) * 14}s`,
      delay: `${-rand(5) * 16}s`,
      dx: `${-40 + rand(6) * 80}px`,
      dy: `${-160 - rand(7) * 160}px`,
      gold: i % 4 === 0,
    };
  });

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className={cn("particle", p.gold ? "bg-gold/70" : "bg-cyan/60")}
          style={
            {
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              "--dur": p.dur,
              "--delay": p.delay,
              "--dx": p.dx,
              "--dy": p.dy,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Abstract financial graph lines used as a subtle section background. */
export function ChartLines({ className, animate = false }: { className?: string; animate?: boolean }) {
  return (
    <svg
      className={cn("pointer-events-none absolute", className)}
      viewBox="0 0 1200 400"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="clGold" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#F5C400" stopOpacity="0" />
          <stop offset="0.5" stopColor="#F5C400" stopOpacity="0.8" />
          <stop offset="1" stopColor="#F5C400" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="clCyan" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#36B5E5" stopOpacity="0" />
          <stop offset="0.5" stopColor="#36B5E5" stopOpacity="0.7" />
          <stop offset="1" stopColor="#36B5E5" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="clArea" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#36B5E5" stopOpacity="0.18" />
          <stop offset="1" stopColor="#36B5E5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 330 C 120 320, 180 280, 280 270 S 420 250, 520 210 S 680 170, 780 150 S 960 90, 1060 70 S 1160 40, 1200 30 V400 H0 Z"
        fill="url(#clArea)"
      />
      <path
        d="M0 330 C 120 320, 180 280, 280 270 S 420 250, 520 210 S 680 170, 780 150 S 960 90, 1060 70 S 1160 40, 1200 30"
        stroke="url(#clGold)"
        strokeWidth="2"
        className={cn(animate && "animate-dash")}
      />
      <path
        d="M0 360 C 150 350, 220 330, 320 320 S 480 300, 580 280 S 740 250, 840 235 S 1020 190, 1200 160"
        stroke="url(#clCyan)"
        strokeWidth="1.5"
        strokeDasharray="6 8"
      />
      {[280, 520, 780, 1060].map((x, i) => {
        const ys = [270, 210, 150, 70];
        return (
          <g key={x}>
            <line x1={x} y1={ys[i]} x2={x} y2="400" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle cx={x} cy={ys[i]} r="4" fill="#062B52" stroke="#F5C400" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

/** Soft geometric emblem-inspired rings used in light sections. */
export function Rings({ className }: { className?: string }) {
  return (
    <svg className={cn("pointer-events-none absolute", className)} viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <circle cx="300" cy="300" r="290" stroke="rgba(8,127,193,0.10)" strokeWidth="1.5" />
      <circle cx="300" cy="300" r="230" stroke="rgba(8,127,193,0.10)" strokeWidth="1.5" strokeDasharray="4 8" />
      <circle cx="300" cy="300" r="170" stroke="rgba(217,159,0,0.22)" strokeWidth="2" />
      <circle cx="300" cy="300" r="110" stroke="rgba(8,127,193,0.10)" strokeWidth="1.5" />
    </svg>
  );
}
