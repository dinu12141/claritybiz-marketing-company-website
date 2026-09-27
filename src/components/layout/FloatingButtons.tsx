import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { site } from "@/data/site";
import { cn } from "@/utils/cn";

const tooltip =
  "pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-l-navy";

/** Persistent, unobtrusive contact shortcuts (WhatsApp + phone). */
export function FloatingButtons() {
  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      aria-label="Quick contact"
    >
      <a
        href={site.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={cn(
          "group relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] transition-transform duration-300 hover:scale-105 sm:h-13 sm:w-13",
        )}
      >
        <WhatsAppIcon className="h-6 w-6" />
        <span className={tooltip} role="tooltip">
          Chat on WhatsApp
        </span>
      </a>
      <a
        href={site.phoneHref}
        aria-label={`Call ${site.phoneDisplay}`}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-navy text-gold shadow-[0_10px_30px_-8px_rgba(6,43,82,0.6)] ring-2 ring-gold/70 transition-transform duration-300 hover:scale-105 sm:h-13 sm:w-13"
      >
        <Phone className="h-5 w-5" />
        <span className={tooltip} role="tooltip">
          Call {site.phoneDisplay}
        </span>
      </a>
    </div>
  );
}
