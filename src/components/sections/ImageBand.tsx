import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import type { SiteImage } from "@/data/images";
import { cn } from "@/utils/cn";

type ImageBandProps = {
  image: SiteImage;
  children: ReactNode;
  className?: string;
  /** How strongly the photo is toned down (higher = darker). */
  overlay?: "soft" | "strong";
  ariaLabelledBy?: string;
};

/** Full-width photographic band with navy brand overlay and centered content. */
export function ImageBand({ image, children, className, overlay = "strong", ariaLabelledBy }: ImageBandProps) {
  return (
    <section
      className={cn("on-dark relative overflow-hidden bg-navy text-white", className)}
      aria-labelledby={ariaLabelledBy}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div
        className={cn(
          "absolute inset-0",
          overlay === "strong"
            ? "bg-gradient-to-r from-navy-deep/95 via-navy/85 to-navy/60"
            : "bg-gradient-to-r from-navy-deep/90 via-navy/70 to-navy/35",
        )}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true" />
      <Container className="relative py-16 sm:py-20 lg:py-24">{children}</Container>
    </section>
  );
}
