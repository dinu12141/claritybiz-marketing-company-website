import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoImage, LogoLockup } from "@/components/ui/Logo";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { primaryNav, site } from "@/data/site";
import { services } from "@/data/services";
import { images } from "@/data/images";
import { useLockBodyScroll, useScrolled } from "@/hooks/useUi";
import { cn } from "@/utils/cn";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative rounded-lg px-3 py-2 text-[15px] font-medium transition-colors duration-200",
    "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gold after:transition-transform after:duration-300 after:origin-left",
    isActive
      ? "text-navy after:scale-x-100"
      : "text-ink/75 hover:text-navy after:scale-x-0 hover:after:scale-x-100",
  );

export function Header() {
  const scrolled = useScrolled(24);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(
    location.pathname.startsWith("/services"),
  );
  const megaRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<number | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(mobileOpen);

  // Close menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  // Focus management for the mobile drawer
  useEffect(() => {
    if (mobileOpen) {
      closeButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  // Escape closes any open menu; click outside closes the mega menu
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mobileOpen) closeMobile();
      if (megaOpen) setMegaOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(event.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [mobileOpen, megaOpen, closeMobile]);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleCloseMega = () => {
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  };

  const servicesActive = location.pathname.startsWith("/services");

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-50 w-full border-b backdrop-blur-md",
        scrolled
          ? "border-line/80 bg-white/90 shadow-[0_8px_30px_-12px_rgba(6,43,82,0.18)]"
          : "border-transparent bg-white/75",
      )}
    >
      <Container>
        <div
          className={cn(
            "site-header flex items-center justify-between gap-4",
            scrolled ? "h-[var(--header-h-compact)]" : "h-[var(--header-h)]",
          )}
        >
          <LogoLockup size={scrolled ? 36 : 42} priority />

          {/* Desktop navigation */}
          <nav className="hidden lg:block" aria-label="Primary">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) =>
                item.children ? (
                  <li
                    key={item.to}
                    ref={megaRef}
                    className="relative"
                    onMouseEnter={openMega}
                    onMouseLeave={scheduleCloseMega}
                  >
                    <div className="flex items-center">
                      <NavLink to={item.to} className={navLinkClass} end>
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        className={cn(
                          "-ml-2 flex h-8 w-7 items-center justify-center rounded-md text-ink/60 transition-colors hover:text-navy",
                          servicesActive && "text-navy",
                        )}
                        aria-expanded={megaOpen}
                        aria-controls="services-mega-menu"
                        aria-label="Open services menu"
                        onClick={() => setMegaOpen((open) => !open)}
                      >
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform duration-300", megaOpen && "rotate-180")}
                        />
                      </button>
                    </div>

                    {/* Mega menu */}
                    <div
                      id="services-mega-menu"
                      className={cn(
                        "absolute left-1/2 top-full z-50 w-[580px] -translate-x-1/2 pt-2 transition-all duration-200",
                        megaOpen
                          ? "pointer-events-auto visible translate-y-0 opacity-100"
                          : "pointer-events-none invisible -translate-y-1 opacity-0",
                      )}
                    >
                      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_50px_-15px_rgba(6,43,82,0.3)]">
                        <div className="grid grid-cols-[1.52fr_1fr]">
                          <div className="p-2.5">
                            <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                              Our Services
                            </p>
                            <ul className="grid grid-cols-1 gap-0.5">
                              {services.map((service) => {
                                const Icon = service.icon;
                                return (
                                  <li key={service.slug}>
                                    <Link
                                      to={service.path}
                                      className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-light focus-visible:bg-light"
                                      onClick={() => setMegaOpen(false)}
                                    >
                                      <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-line">
                                        <img
                                          src={service.image.src}
                                          alt=""
                                          aria-hidden="true"
                                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                          loading="lazy"
                                          decoding="async"
                                        />
                                        <span
                                          className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent"
                                          aria-hidden="true"
                                        />
                                        <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded bg-gold text-navy shadow-xs">
                                          <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
                                        </span>
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className="block text-[13px] font-semibold text-navy leading-tight">
                                          {service.name}
                                        </span>
                                        <span className="mt-0.5 line-clamp-1 block text-[11px] leading-tight text-muted">
                                          {service.description}
                                        </span>
                                      </span>
                                      <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-royal opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                            <Link
                              to="/services"
                              className="mt-1 inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-royal hover:text-navy"
                              onClick={() => setMegaOpen(false)}
                            >
                              View all services <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                          <div className="on-dark relative flex flex-col justify-between overflow-hidden bg-navy p-4 text-white">
                            <img
                              src={images.officeDesk.src}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                            <div
                              className="absolute inset-0 bg-gradient-to-b from-navy-deep/85 via-navy/85 to-navy-deep/95"
                              aria-hidden="true"
                            />
                            <div className="bg-grid-dark absolute inset-0 opacity-40" aria-hidden="true" />
                            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent" aria-hidden="true" />
                            <div className="relative">
                              <LogoImage size={34} className="mb-2 ring-1 ring-gold/70" />
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan">Need guidance?</p>
                              <p className="mt-1.5 font-display text-sm font-bold leading-snug">
                                Not sure which service fits your requirement?
                              </p>
                              <p className="mt-1 text-[11px] leading-relaxed text-white/70">
                                Talk to us and we will point you in the right direction — clearly and without jargon.
                              </p>
                            </div>
                            <div className="relative mt-3 space-y-2">
                              <Button to="/consultation" size="sm" className="w-full h-8 text-xs font-semibold" onClick={() => setMegaOpen(false)}>
                                Get Consultation
                              </Button>
                              <a
                                href={site.phoneHref}
                                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white/85 hover:text-gold"
                              >
                                <Phone className="h-3.5 w-3.5" /> {site.phoneDisplay}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink to={item.to} className={navLinkClass} end={item.to === "/"}>
                      {item.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button to="/consultation" size="sm" className="hidden lg:inline-flex">
              Get Consultation
            </Button>
            <a
              href={site.phoneHref}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white shadow-card transition-colors hover:bg-deep-blue lg:hidden"
              aria-label={`Call ${site.phoneDisplay}`}
            >
              <Phone className="h-[18px] w-[18px]" />
            </a>
            <button
              ref={hamburgerRef}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-navy transition-colors hover:bg-light lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile navigation drawer */}
      <div
        id="mobile-navigation"
        className={cn("fixed inset-0 z-[60] lg:hidden", !mobileOpen && "pointer-events-none")}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-navy/50 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMobile}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(100%,380px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <LogoLockup size={42} />
            <button
              ref={closeButtonRef}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-navy hover:bg-light"
              aria-label="Close navigation menu"
              onClick={closeMobile}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
            <ul className="space-y-1">
              {primaryNav.map((item) =>
                item.children ? (
                  <li key={item.to}>
                    <div className="flex items-center">
                      <NavLink
                        to={item.to}
                        end
                        className={({ isActive }) =>
                          cn(
                            "flex-1 rounded-xl px-4 py-3 text-base font-semibold",
                            isActive ? "bg-light text-navy" : "text-ink hover:bg-light",
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        className="ml-1 flex h-11 w-11 items-center justify-center rounded-xl text-navy hover:bg-light"
                        aria-expanded={mobileServicesOpen}
                        aria-controls="mobile-services-list"
                        aria-label="Toggle services list"
                        onClick={() => setMobileServicesOpen((open) => !open)}
                      >
                        <ChevronDown
                          className={cn("h-5 w-5 transition-transform duration-300", mobileServicesOpen && "rotate-180")}
                        />
                      </button>
                    </div>
                    <ul
                      id="mobile-services-list"
                      className={cn(
                        "grid transition-all duration-300",
                        mobileServicesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <li className="overflow-hidden">
                        <ul className="ml-4 space-y-0.5 border-l-2 border-gold/60 pl-3 pt-1 pb-2">
                          {item.children.map((child) => {
                            const thumb = services.find((service) => service.path === child.to)?.image;
                            return (
                              <li key={child.to}>
                                <NavLink
                                  to={child.to}
                                  className={({ isActive }) =>
                                    cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium",
                                      isActive ? "bg-light text-navy" : "text-ink/80 hover:bg-light hover:text-navy",
                                    )
                                  }
                                  tabIndex={mobileServicesOpen ? 0 : -1}
                                >
                                  {thumb && (
                                    <img
                                      src={thumb.src}
                                      alt=""
                                      aria-hidden="true"
                                      className="h-9 w-11 shrink-0 rounded-lg object-cover ring-1 ring-line"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  )}
                                  {child.label}
                                </NavLink>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-xl px-4 py-3 text-base font-semibold",
                          isActive ? "bg-light text-navy" : "text-ink hover:bg-light",
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ),
              )}
              <li>
                <NavLink
                  to="/blog"
                  className={({ isActive }) =>
                    cn(
                      "block rounded-xl px-4 py-3 text-base font-semibold",
                      isActive ? "bg-light text-navy" : "text-ink hover:bg-light",
                    )
                  }
                >
                  Insights
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="space-y-3 border-t border-line bg-light/60 p-5">
            <Button href={site.phoneHref} className="w-full" size="md">
              <Phone className="h-4 w-4" /> Call Now · {site.phoneDisplay}
            </Button>
            <Button
              href={site.whatsappHref}
              variant="navy"
              className="w-full bg-[#1f9d55] hover:bg-[#178a49]"
              size="md"
            >
              <WhatsAppIcon className="h-4.5 w-4.5" /> Chat on WhatsApp
            </Button>
            <div className="flex items-center justify-between pt-1 text-sm">
              <Link to="/consultation" className="font-semibold text-royal hover:text-navy">
                Get Consultation →
              </Link>
              <a
                href={site.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted hover:text-navy"
                aria-label="TV Clarity Capital on Facebook"
              >
                <FacebookIcon className="h-4 w-4" /> Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
