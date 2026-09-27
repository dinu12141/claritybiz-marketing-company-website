import { useEffect, useState } from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminApp } from "@/admin/AdminApp";
import { Layout } from "@/components/layout/Layout";
import { LogoImage } from "@/components/ui/Logo";
import { loadCmsContent } from "@/content/cms";
import { isFileProtocol, resolveBasename } from "@/lib/router";
import { isSupabaseConfigured } from "@/lib/supabase";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { WhyChooseUsPage } from "@/pages/WhyChooseUsPage";
import { FaqPage } from "@/pages/FaqPage";
import { ContactPage } from "@/pages/ContactPage";
import { ConsultationPage } from "@/pages/ConsultationPage";
import { BlogPage } from "@/pages/BlogPage";
import { BlogPostPage } from "@/pages/BlogPostPage";
import { LegalPage } from "@/pages/LegalPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Admin portal — separate shell, protected by Supabase Auth + RLS */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* Public website */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="index.html" element={<Navigate to="/" replace />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/:slug" element={<ServiceDetailPage />} />
        <Route path="why-choose-us" element={<WhyChooseUsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="consultation" element={<ConsultationPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="privacy-policy" element={<LegalPage kind="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function BootSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white" aria-busy="true" aria-label="Loading">
      <LogoImage size={72} priority className="animate-pulse ring-2 ring-gold/60" />
    </div>
  );
}

export default function App() {
  // When Supabase is configured, CMS-managed content (settings, services,
  // pages, FAQs, posts, SEO) is loaded once before the first render so every
  // component sees the managed values. Falls back to built-in content.
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (ready) return;
    let active = true;
    loadCmsContent().finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [ready]);

  if (!ready) return <BootSplash />;

  // HashRouter keeps navigation working if the built file is opened from disk;
  // otherwise clean URLs are used with a runtime-resolved base path.
  if (isFileProtocol()) {
    return (
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    );
  }

  return (
    <BrowserRouter basename={resolveBasename()}>
      <AppRoutes />
    </BrowserRouter>
  );
}
