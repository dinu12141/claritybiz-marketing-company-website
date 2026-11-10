import { ArrowUpRight, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { LogoLockup } from "@/components/ui/Logo";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { footerQuickLinks, footerServiceLinks, site } from "@/data/site";

const FooterHeading = ({ children }: { children: string }) => (
  <h3 className="mb-3 md:mb-5 font-display text-xs md:text-sm font-bold uppercase tracking-[0.16em] text-white">
    <span className="mr-1.5 md:mr-2 inline-block h-1.5 w-1.5 md:h-2 md:w-2 rounded-sm bg-gold align-middle" aria-hidden="true" />
    {children}
  </h3>
);

const footerLink =
  "inline-flex items-center gap-1.5 text-sm md:text-[15px] text-white/70 transition-colors hover:text-gold py-0.5";

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-navy-deep text-white">
      <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-royal/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />

      <Container className="relative">
        <div className="grid gap-8 py-10 sm:py-12 md:grid-cols-2 md:gap-12 md:py-16 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10 lg:py-20">
          {/* Brand */}
          <div className="space-y-4">
            <div className="hidden md:block">
              <LogoLockup tone="light" size={56} withTagline />
            </div>
            <div className="block md:hidden">
              <LogoLockup tone="light" size={44} withTagline />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/65 md:text-[15px]">
              Accounting, auditing, business registration, business consulting and IT solutions for
              individuals and businesses — delivered with clarity and professionalism from Monaragala,
              Sri Lanka.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={site.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TV Clarity Capital on Facebook"
                className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all hover:border-gold hover:bg-gold hover:text-navy"
              >
                <FacebookIcon className="h-4 w-4 md:h-4.5 md:w-4.5" />
              </a>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with TV Clarity Capital on WhatsApp"
                className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all hover:border-gold hover:bg-gold hover:text-navy"
              >
                <WhatsAppIcon className="h-4 w-4 md:h-4.5 md:w-4.5" />
              </a>
              <a
                href={site.phoneHref}
                aria-label={`Call ${site.phoneDisplay}`}
                className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all hover:border-gold hover:bg-gold hover:text-navy"
              >
                <Phone className="h-4 w-4 md:h-4.5 md:w-4.5" />
              </a>
              {site.socials.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.shortName} on ${social.label}`}
                  title={social.label}
                  className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all hover:border-gold hover:bg-gold hover:text-navy"
                >
                  <Globe className="h-4 w-4 md:h-4.5 md:w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links & Services: 2 columns on mobile, dedicated columns on desktop */}
          <div className="col-span-full grid grid-cols-2 gap-6 border-y border-white/10 py-6 md:col-span-1 md:contents">
            {/* Quick links */}
            <nav aria-label="Footer quick links">
              <FooterHeading>Quick Links</FooterHeading>
              <ul className="space-y-2 md:space-y-3">
                {footerQuickLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Services */}
            <nav aria-label="Footer services">
              <FooterHeading>Services</FooterHeading>
              <ul className="space-y-2 md:space-y-3">
                {footerServiceLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <FooterHeading>Contact</FooterHeading>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-2.5 md:gap-3">
                <span className="mt-0.5 flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-gold">
                  <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </span>
                <div>
                  <p className="text-xs text-white/50 md:text-sm">Location</p>
                  <p className="text-sm font-medium text-white md:text-[15px]">{site.location}</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 md:gap-3">
                <span className="mt-0.5 flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-[#25D366]">
                  <WhatsAppIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-white/50 md:text-sm">WhatsApp</p>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                      Fastest
                    </span>
                  </div>
                  <a
                    href={site.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#25D366] hover:underline md:text-[15px]"
                  >
                    {site.whatsappDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 md:gap-3">
                <span className="mt-0.5 flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-gold">
                  <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </span>
                <div>
                  <p className="text-xs text-white/50 md:text-sm">Voice / Direct Call</p>
                  <a href={site.phoneHref} className="text-sm font-medium text-white hover:text-gold md:text-[15px]">
                    {site.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 md:gap-3">
                <span className="mt-0.5 flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-cyan">
                  <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </span>
                <div>
                  <p className="text-xs text-white/50 md:text-sm">Email</p>
                  <a href={`mailto:${site.email}`} className="break-all text-xs sm:text-sm font-medium text-white hover:text-gold">
                    {site.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 md:gap-3">
                <span className="mt-0.5 flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-gold">
                  <FacebookIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </span>
                <div>
                  <p className="text-xs text-white/50 md:text-sm">Social</p>
                  <a
                    href={site.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-gold md:text-[15px]"
                  >
                    Facebook <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-4 md:mt-6 inline-flex h-10 md:h-11 w-full sm:w-auto items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-navy transition-colors hover:bg-gold-dark"
            >
              Request a Consultation
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-4 text-xs text-white/55 sm:flex-row md:py-6 md:text-sm">
          <p className="text-center sm:text-left">
            © {site.copyrightYear} {site.name}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-5 sm:gap-6">
            <Link to="/privacy-policy" className="hover:text-gold">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gold">
              Terms of Use
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
