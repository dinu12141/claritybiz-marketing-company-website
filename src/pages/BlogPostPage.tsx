import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoImage } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { CtaSection } from "@/components/sections/CtaSection";
import { PageHero } from "@/components/sections/PageHero";
import { blogPosts, getPostBySlug, type BlogPost } from "@/data/blog";
import { imageForCategory } from "@/data/images";
import { site } from "@/data/site";
import { useSeo } from "@/hooks/useSeo";

export function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  if (!post) return <Navigate to="/blog" replace />;
  return <Article key={post.slug} post={post} />;
}

function Article({ post }: { post: BlogPost }) {
  const others = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const featured = post.image ?? imageForCategory(post.category);

  useSeo({
    title: post.seo.title,
    description: post.seo.description,
    path: `/blog/${post.slug}`,
    type: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        articleSection: post.category,
        author: { "@type": "Organization", name: site.name },
        publisher: { "@type": "Organization", name: site.name },
      },
    ],
  });

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        text={post.excerpt}
        crumbs={[{ label: "Insights", to: "/blog" }, { label: post.title }]}
        compact
        className="pb-16 sm:pb-24"
      />

      <section className="pb-16 sm:pb-20 lg:pb-28" aria-label="Article">
        <Container>
          <Reveal className="relative z-10 -mt-10 mb-12 sm:-mt-16 lg:mb-16">
            <figure className="overflow-hidden rounded-3xl shadow-[0_30px_70px_-25px_rgba(6,43,82,0.45)] ring-1 ring-white/60">
              <img
                src={featured.src}
                alt={featured.alt}
                className="aspect-[21/9] w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </figure>
          </Reveal>
          <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
            <Reveal>
              <article className="max-w-3xl">
                <div className="mb-8 flex items-center gap-3 text-sm text-muted">
                  <LogoImage size={40} />
                  <div>
                    <p className="font-semibold text-ink">{site.shortName}</p>
                    <p>{post.readTime}</p>
                  </div>
                </div>
                <div className="space-y-5 text-base leading-relaxed text-ink/85 sm:text-lg">
                  {post.content.map((block, index) =>
                    block.startsWith("## ") ? (
                      <h2 key={index} className="pt-4 text-2xl font-bold text-ink">
                        {block.replace(/^## /, "")}
                      </h2>
                    ) : (
                      <p key={index}>{block}</p>
                    ),
                  )}
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
                  <Button to="/blog" variant="outline">
                    <ArrowLeft className="h-4 w-4" /> All insights
                  </Button>
                  <Button to="/consultation">
                    Discuss your requirement <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            </Reveal>

            <Reveal delay={120} className="lg:sticky lg:top-28 lg:self-start">
              <div className="card p-6">
                <p className="eyebrow text-royal">More insights</p>
                <ul className="mt-4 space-y-4">
                  {others.map((item) => (
                    <li key={item.slug}>
                      <Link to={`/blog/${item.slug}`} className="group block">
                        <span className="text-xs font-semibold text-gold-dark">{item.category}</span>
                        <span className="mt-1 block text-[15px] font-semibold leading-snug text-ink group-hover:text-royal">
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="gradient-navy on-dark mt-5 rounded-2xl p-6 text-white">
                <p className="font-display text-lg font-bold">Need practical help?</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Talk to TV Clarity Capital about accounting, business setup, consulting or IT.
                </p>
                <Button to="/consultation" size="sm" className="mt-5 w-full">
                  Get a Consultation
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaSection className="pb-16 sm:pb-20 lg:pb-28" />
    </>
  );
}
