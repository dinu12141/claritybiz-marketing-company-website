import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaSection } from "@/components/sections/CtaSection";
import { PageHero } from "@/components/sections/PageHero";
import { blogPosts } from "@/data/blog";
import { imageForCategory, images } from "@/data/images";
import { useSeo } from "@/hooks/useSeo";

export function BlogPage() {
  useSeo({
    title: "Insights | Accounting, Business & Technology Articles | TV Clarity Capital",
    description:
      "Practical insights from TV Clarity Capital on bookkeeping, business registration, business consulting and digital tools for small and growing businesses in Sri Lanka.",
    path: "/blog",
  });

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Practical Insights for Your Business"
        text="Short, useful articles on accounting, business setup, consulting and technology, written to help you make clearer decisions."
        crumbs={[{ label: "Insights" }]}
        image={images.officeDesk}
        compact
      />

      <section className="section-y" aria-labelledby="articles-heading">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Latest Articles"
            title={<span id="articles-heading">Read Our Latest Insights</span>}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {blogPosts.map((post, index) => {
              const image = post.image ?? imageForCategory(post.category);
              return (
              <Reveal key={post.slug} delay={index * 80}>
                <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[2/1] overflow-hidden">
                    <img
                      src={image.src}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/15 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-6 bottom-4 flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy">
                        {post.category}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">{post.readTime}</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h2 className="text-xl font-bold leading-snug text-ink">
                      <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">{post.excerpt}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-royal group-hover:text-navy">
                      Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <CtaSection className="pb-16 sm:pb-20 lg:pb-28" />
    </>
  );
}
