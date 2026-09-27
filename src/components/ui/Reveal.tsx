import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useUi";
import { cn } from "@/utils/cn";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms */
  delay?: number;
  style?: CSSProperties;
};

/** Fades and lifts content into view when it enters the viewport. */
export function Reveal({ as, children, className, delay = 0, style }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      ref={ref}
      className={cn("reveal", inView && "is-visible", className)}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` } as CSSProperties}
    >
      {children}
    </Component>
  );
}
