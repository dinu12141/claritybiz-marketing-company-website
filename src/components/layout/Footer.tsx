import { ArrowUpRight, Globe, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { LogoLockup } from "@/components/ui/Logo";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { footerQuickLinks, footerServiceLinks, site } from "@/data/site";

const FooterHeading = ({ children }: { children: string }) => (
  <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
    <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-gold align-middle" aria-hidden="true" />
    {children}
  </h3>
);

const footerLink =
  "inline-flex items-center gap-1.5 text-[15px] text-white/70 transition-colors hover:text-gold";

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
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10 lg:py-20">
          {/* Brand */}
          <div>
            <LogoLockup tone="light" size={56} withTagline />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/65">
              Accounting, auditing, business registration, business consulting and IT solutions for
              individuals and businesses — delivered with clarity and professionalism from Monaragala,
              Sri Lanka.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TV Clarity Capital on Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all hover:border-gold hover:bg-gold hover:text-navy"
              >
                <FacebookIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with TV Clarity Capital on WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all hover:border-gold hover:bg-gold hover:text-navy"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={site.phoneHref}
                aria-label={`Call ${site.phoneDisplay}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all hover:border-gold hover:bg-gold hover:text-navy"
              >
                <Phone className="h-4.5 w-4.5" />
              </a>
              {site.socials.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.shortName} on ${social.label}`}
                  title={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-all hover:border-gold hover:bg-gold hover:text-navy"
                >
                  <Globe className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer quick links">
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="space-y-3">
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
            <ul className="space-y-3">
              {footerServiceLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <FooterHeading>Contact</FooterHeading>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-gold">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm text-white/50">Location</p>
                  <p className="text-[15px] font-medium text-white">{site.location}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-gold">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm text-white/50">Phone / WhatsApp</p>
                  <a href={site.phoneHref} className="text-[15px] font-medium text-white hover:text-gold">
                    {site.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-gold">
                  <FacebookIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm text-white/50">Social</p>
                  <a
                    href={site.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[15px] font-medium text-white hover:text-gold"
                  >
                    Facebook <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-navy transition-colors hover:bg-gold-dark"
            >
              Request a Consultation
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-white/55 md:flex-row">
          <p className="text-center md:text-left">
            © {site.copyrightYear} {site.name}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
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
