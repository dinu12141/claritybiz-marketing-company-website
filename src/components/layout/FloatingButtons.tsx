import { CalendarCheck, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { AiChatBot } from "@/components/ai/AiChatBot";
import { site } from "@/data/site";
import { cn } from "@/utils/cn";

/**
 * Persistent UI controls:
 * 1. Bottom-Right: Round AI ChatBot FAB
 * 2. Right-Side Dock: High-end expandable contact & social media shortcuts
 */
export function FloatingButtons() {
  const sideItems = [
    {
      key: "whatsapp",
      label: `WhatsApp · ${site.whatsappDisplay}`,
      badge: "Fastest",
      href: site.whatsappHref,
      external: true,
      icon: WhatsAppIcon,
      bgClass: "bg-[#25D366] hover:bg-[#1ebd5a] text-white shadow-[-4px_4px_16px_rgba(37,211,102,0.35)]",
      iconClass: "text-white",
    },
    {
      key: "phone",
      label: `Call · ${site.phoneDisplay}`,
      href: site.phoneHref,
      external: false,
      icon: Phone,
      bgClass: "bg-navy hover:bg-deep-blue text-gold border-y border-l border-gold/40 shadow-[-4px_4px_16px_rgba(6,43,82,0.4)]",
      iconClass: "text-gold",
    },
    {
      key: "facebook",
      label: "Facebook Page",
      href: site.facebookUrl,
      external: true,
      icon: FacebookIcon,
      bgClass: "bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-[-4px_4px_16px_rgba(24,119,242,0.35)]",
      iconClass: "text-white",
    },
    {
      key: "email",
      label: `Email · ${site.email}`,
      href: `mailto:${site.email}`,
      external: false,
      icon: Mail,
      bgClass: "bg-gradient-to-r from-sky-600 to-royal hover:from-sky-500 hover:to-blue-700 text-white shadow-[-4px_4px_16px_rgba(2,132,199,0.35)]",
      iconClass: "text-white",
    },
    {
      key: "consultation",
      label: "Book Consultation",
      to: "/consultation",
      icon: CalendarCheck,
      bgClass: "bg-gold hover:bg-gold-dark text-navy font-bold shadow-[-4px_4px_16px_rgba(212,175,55,0.45)]",
      iconClass: "text-navy",
    },
  ];

  return (
    <>
      {/* 1. Dedicated Round AI ChatBot FAB (Bottom-Right) */}
      <AiChatBot />

      {/* 2. Professional Right-Side Social & Contact Dock (Right Edge) */}
      <aside
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-2 pointer-events-auto"
        aria-label="Quick contact & social channels"
      >
        {sideItems.map((item) => {
          const Icon = item.icon;
          const commonContent = (
            <>
              {/* Expandable Label on Hover (Desktop) */}
              <div className="flex items-center overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-300 ease-out">
                <span className="whitespace-nowrap pl-3 pr-2 text-xs font-bold tracking-wide">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="mr-2 rounded bg-black/25 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Icon Container (Always visible on right edge) */}
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center">
                <Icon className={cn("h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-115", item.iconClass)} />
              </div>
            </>
          );

          if (item.to) {
            return (
              <Link
                key={item.key}
                to={item.to}
                aria-label={item.label}
                className={cn(
                  "group flex items-center justify-end rounded-l-2xl transition-all duration-300 hover:-translate-x-1",
                  item.bgClass,
                )}
              >
                {commonContent}
              </Link>
            );
          }

          return (
            <a
              key={item.key}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={item.label}
              className={cn(
                "group flex items-center justify-end rounded-l-2xl transition-all duration-300 hover:-translate-x-1",
                item.bgClass,
              )}
            >
              {commonContent}
            </a>
          );
        })}
      </aside>
    </>
  );
}
