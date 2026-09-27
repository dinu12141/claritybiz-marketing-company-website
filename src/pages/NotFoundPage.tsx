import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoImage } from "@/components/ui/Logo";
import { Rings } from "@/components/decor/Backgrounds";
import { useSeo } from "@/hooks/useSeo";

export function NotFoundPage() {
  useSeo({
    title: "Page Not Found | TV Clarity Capital (Pvt) Ltd",
    description: "The page you are looking for could not be found. Return to the TV Clarity Capital homepage.",
    path: "/404",
  });

  return (
    <section className="relative overflow-hidden bg-light py-24 sm:py-32" aria-labelledby="nf-heading">
      <div className="bg-grid-light absolute inset-0 opacity-60" aria-hidden="true" />
      <Rings className="left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2" />
      <Container className="relative text-center">
        <LogoImage size={96} priority className="mx-auto ring-4 ring-white shadow-card" />
        <p className="mt-8 font-display text-sm font-bold uppercase tracking-[0.2em] text-gold-dark">Error 404</p>
        <h1 id="nf-heading" className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">
          The page you are looking for may have been moved or no longer exists. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/">
            <Home className="h-4 w-4" /> Back to Home
          </Button>
          <Button to="/services" variant="outline">
            <ArrowLeft className="h-4 w-4" /> View Services
          </Button>
        </div>
      </Container>
    </section>
  );
}
