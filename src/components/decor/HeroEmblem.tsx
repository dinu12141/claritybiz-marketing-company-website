import { ChartColumn, ShieldCheck, TrendingUp, Cpu } from "lucide-react";
import { LogoImage } from "@/components/ui/Logo";
import { cn } from "@/utils/cn";

const orbitBadges = [
  { icon: TrendingUp, label: "Growth", className: "top-[6%] right-[8%]", delay: "0s" },
  { icon: ShieldCheck, label: "Trust", className: "bottom-[12%] left-[2%]", delay: "1.4s" },
  { icon: ChartColumn, label: "Finance", className: "top-[30%] left-[-4%]", delay: "0.7s" },
  { icon: Cpu, label: "Technology", className: "bottom-[6%] right-[10%]", delay: "2.1s" },
];

type HeroEmblemProps = { className?: string };

/** The brand emblem presented inside a premium glass/orbital composition. */
export function HeroEmblem({ className }: HeroEmblemProps) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[380px] xl:max-w-[410px]",
        className,
      )}
      aria-hidden="true"
    >
      {/* Ambient glow */}
      <div className="absolute inset-[8%] rounded-full bg-cyan/25 blur-3xl" />
      <div className="absolute inset-[22%] rounded-full bg-gold/15 blur-3xl" />

      {/* Rotating dashed orbit */}
      <svg
        className="animate-spin-slow absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="48.5" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" strokeDasharray="1.2 2.4" />
        <circle cx="50" cy="1.5" r="1.4" fill="#F5C400" />
        <circle cx="98.5" cy="50" r="1" fill="#36B5E5" />
      </svg>

      {/* Counter-rotating gold arc */}
      <svg className="animate-spin-slower absolute inset-[7%] h-[86%] w-[86%]" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <path d="M 50 2 A 48 48 0 0 1 98 50" stroke="url(#heroGoldArc)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 50 98 A 48 48 0 0 1 2 50" stroke="rgba(54,181,229,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <defs>
          <linearGradient id="heroGoldArc" x1="50" y1="2" x2="98" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5C400" />
            <stop offset="1" stopColor="#F5C400" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Pulse ring */}
      <div className="animate-pulse-ring absolute inset-[15%] rounded-full border border-cyan/40" />

      {/* Glass disc holding the emblem */}
      <div className="glass animate-float absolute inset-[16%] rounded-full shadow-glow">
        <div className="absolute inset-[7%] rounded-full bg-white/[0.04] ring-1 ring-white/10" />
        <div className="absolute inset-[9%] overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
          <LogoImage size={460} priority fluid className="h-full w-full" />
        </div>
      </div>

      {/* Floating chips */}
      {orbitBadges.map(({ icon: Icon, label, className: pos, delay }) => (
        <div
          key={label}
          className={cn(
            "glass animate-float absolute flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[11px] font-semibold text-white/90 shadow-lg sm:text-xs",
            pos,
          )}
          style={{ animationDelay: delay, animationDuration: "8s" }}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-navy sm:h-7 sm:w-7">
            <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          {label}
        </div>
      ))}

      {/* Mini chart card */}
      <div className="glass absolute -bottom-2 left-1/2 hidden w-44 -translate-x-1/2 rounded-2xl p-3 shadow-lg sm:block">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/60">
          <span>Clarity</span>
          <span className="text-gold">Growth</span>
        </div>
        <svg viewBox="0 0 160 44" className="h-11 w-full" fill="none">
          <defs>
            <linearGradient id="miniFill" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#36B5E5" stopOpacity="0.5" />
              <stop offset="1" stopColor="#36B5E5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 38 C 20 36, 30 30, 45 28 S 70 24, 85 18 S 115 12, 130 8 S 150 4, 160 2 V44 H0 Z" fill="url(#miniFill)" />
          <path d="M0 38 C 20 36, 30 30, 45 28 S 70 24, 85 18 S 115 12, 130 8 S 150 4, 160 2" stroke="#F5C400" strokeWidth="2" strokeLinecap="round" />
          <circle cx="160" cy="2" r="3" fill="#F5C400" />
        </svg>
      </div>
    </div>
  );
}
