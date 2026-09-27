import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ExternalLink, Images, Newspaper, Pencil, Plus, Save, Trash } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPost, deletePost, getPost, listPosts, updatePost, type PostInput } from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Badge, Card, CardHeader, ConfirmDialog, EmptyState, ErrorState, Field, Input, PageHeader, SearchInput, Select, Skeleton, Textarea, useToast } from "@/admin/components/ui";
import { MediaPickerModal } from "@/admin/pages/MediaPage";
import { formatDate, fromDateTimeLocal, slugify, timeAgo, toDateTimeLocal, useAsync } from "@/admin/utils";
import type { Tone } from "@/data/consultation";
import { services } from "@/data/services";
import { site } from "@/data/site";
import { errorMessage } from "@/lib/supabase";
import type { BlogPostRow, PostStatus } from "@/lib/types";

const statusTone: Record<PostStatus, Tone> = { draft: "gray", published: "green", archived: "amber" };
const categories = ["Insights", ...services.map((service) => service.shortName), "Business Registration", "General"];

/* ============================================================== list */

export function BlogListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const query = useAsync(listPosts, []);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PostStatus | "">("");
  const [toDelete, setToDelete] = useState<BlogPostRow | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data ?? []).filter((post) => (!status || post.status === status) && (!term || post.title.toLowerCase().includes(term) || (post.category ?? "").toLowerCase().includes(term)));
  }, [query.data, search, status]);

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deletePost(toDelete.id);
      toast({ title: "Post deleted" });
      setToDelete(null);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Delete failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Website"
        title="Blog / Insights"
        description="Publish short, useful articles. Only published posts appear on the website."
        actions={
          <AdminButton icon={Plus} onClick={() => navigate("/admin/blog/new")}>
            New post
          </AdminButton>
        }
      />
      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-[#E3EAF3] p-4 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search posts…" className="sm:w-72" />
          <Select value={status} onChange={(event) => setStatus(event.target.value as PostStatus | "")} className="sm:w-40" aria-label="Filter status">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
        {query.error ? (
          <ErrorState message={query.error} onRetry={() => void query.refetch()} />
        ) : query.loading && !query.data ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Newspaper} title={query.data?.length ? "No posts match your filters" : "No blog posts yet"} description="The website shows its built-in sample insights until you publish posts here." action={<AdminButton icon={Plus} onClick={() => navigate("/admin/blog/new")}>Write a post</AdminButton>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[#E3EAF3] bg-[#F9FBFD] text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Published</th>
                  <th className="px-3 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F8]">
                {rows.map((post) => (
                  <tr key={post.id} className="hover:bg-[#F9FBFD]">
                    <td className="px-4 py-3">
                      <Link to={`/admin/blog/${post.id}`} className="font-semibold text-ink hover:text-royal">
                        {post.title}
                      </Link>
                      <p className="text-xs text-slate-500">/blog/{post.slug}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{post.category ?? "—"}</td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone[post.status]}>{post.status}</Badge>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{post.published_at ? formatDate(post.published_at) : "—"}</td>
                    <td className="px-3 py-3 text-slate-500">{timeAgo(post.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {post.status === "published" && (
                          <Link to={`/blog/${post.slug}`} target="_blank">
                            <AdminButton variant="ghost" size="xs" icon={ExternalLink} aria-label="View" />
                          </Link>
                        )}
                        <Link to={`/admin/blog/${post.id}`}>
                          <AdminButton variant="ghost" size="xs" icon={Pencil} aria-label="Edit" />
                        </Link>
                        <AdminButton variant="ghost" size="xs" icon={Trash} onClick={() => setToDelete(post)} aria-label="Delete" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <ConfirmDialog open={Boolean(toDelete)} title="Delete post?" message={<p>“{toDelete?.title}” will be permanently deleted.</p>} confirmLabel="Delete" loading={busy} onCancel={() => setToDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}

/* ============================================================ editor */

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author_name: string;
  category: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  status: PostStatus;
  published_at: string;
};

const emptyPost: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image_url: "",
  author_name: site.shortName,
  category: "Insights",
  tags: "",
  seo_title: "",
  seo_description: "",
  status: "draft",
  published_at: "",
};

export function BlogEditorPage() {
  const { id = "new" } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const query = useAsync(async () => (isNew ? null : getPost(id)), [id]);
  const [form, setForm] = useState<PostForm>(emptyPost);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const post = query.data;
    if (!post) return;
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      featured_image_url: post.featured_image_url ?? "",
      author_name: post.author_name ?? "",
      category: post.category ?? "Insights",
      tags: (post.tags ?? []).join(", "),
      seo_title: post.seo_title ?? "",
      seo_description: post.seo_description ?? "",
      status: post.status,
      published_at: toDateTimeLocal(post.published_at),
    });
  }, [query.data]);

  const update = <K extends keyof PostForm>(key: K, value: PostForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.title.trim().length < 3 || form.content.trim().length < 20) {
      setError("A title and article content (at least 20 characters) are required.");
      return;
    }
    if (!user) return;
    const publishedAt = form.status === "published" ? fromDateTimeLocal(form.published_at) ?? new Date().toISOString() : fromDateTimeLocal(form.published_at);
    const input: PostInput = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      featured_image_url: form.featured_image_url.trim() || null,
      author_name: form.author_name.trim() || null,
      category: form.category || null,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      status: form.status,
      published_at: publishedAt,
    };
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const created = await createPost(input, user.id);
        toast({ title: "Post created" });
        navigate(`/admin/blog/${created.id}`, { replace: true });
      } else {
        await updatePost(id, input);
        toast({ title: "Post saved" });
        await query.refetch(true);
      }
    } catch (issue) {
      setError(errorMessage(issue));
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && query.error) {
    return (
      <Card padded={false}>
        <ErrorState message={query.error} onRetry={() => void query.refetch()} />
      </Card>
    );
  }
  if (!isNew && query.loading && !query.data) return <Skeleton className="h-96" />;

  return (
    <>
      <div className="mb-6">
        <Link to="/admin/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy">
          <ArrowLeft className="h-3.5 w-3.5" /> All posts
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{isNew ? "New post" : form.title || "Edit post"}</h1>
          <div className="flex gap-2">
            {!isNew && form.status === "published" && (
              <Link to={`/blog/${form.slug}`} target="_blank">
                <AdminButton variant="secondary" icon={ExternalLink}>
                  View post
                </AdminButton>
              </Link>
            )}
            <AdminButton type="submit" form="post-form" icon={Save} loading={saving}>
              {isNew ? "Create post" : "Save changes"}
            </AdminButton>
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <form id="post-form" onSubmit={submit} className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="space-y-4">
            <Field label="Title" htmlFor="p-title" required>
              <Input
                id="p-title"
                value={form.title}
                onChange={(event) => {
                  update("title", event.target.value);
                  if (!slugTouched) update("slug", slugify(event.target.value));
                }}
              />
            </Field>
            <Field label="Slug" htmlFor="p-slug" hint="URL: /blog/{slug}">
              <Input
                id="p-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  update("slug", event.target.value);
                }}
              />
            </Field>
            <Field label="Excerpt" htmlFor="p-excerpt" hint="Short summary shown on listing cards.">
              <Textarea id="p-excerpt" rows={3} value={form.excerpt} onChange={(event) => update("excerpt", event.target.value)} />
            </Field>
            <Field label="Content" htmlFor="p-content" required hint='Separate paragraphs with a blank line. Start a line with "## " for a sub-heading.'>
              <Textarea id="p-content" rows={18} value={form.content} onChange={(event) => update("content", event.target.value)} />
            </Field>
          </Card>
          <Card className="space-y-4">
            <CardHeader title="SEO" />
            <Field label="SEO title" htmlFor="p-seo-title">
              <Input id="p-seo-title" value={form.seo_title} onChange={(event) => update("seo_title", event.target.value)} />
            </Field>
            <Field label="SEO description" htmlFor="p-seo-desc">
              <Textarea id="p-seo-desc" rows={3} value={form.seo_description} onChange={(event) => update("seo_description", event.target.value)} />
            </Field>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="space-y-4">
            <CardHeader title="Publishing" />
            <Field label="Status" htmlFor="p-status">
              <Select id="p-status" value={form.status} onChange={(event) => update("status", event.target.value as PostStatus)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
            <Field label="Publish date" htmlFor="p-date" hint="Defaults to now when publishing.">
              <Input id="p-date" type="datetime-local" value={form.published_at} onChange={(event) => update("published_at", event.target.value)} />
            </Field>
            <Field label="Author" htmlFor="p-author">
              <Input id="p-author" value={form.author_name} onChange={(event) => update("author_name", event.target.value)} />
            </Field>
            <Field label="Category" htmlFor="p-category">
              <Select id="p-category" value={form.category} onChange={(event) => update("category", event.target.value)}>
                {[...new Set(categories)].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tags" htmlFor="p-tags" hint="Comma separated.">
              <Input id="p-tags" value={form.tags} onChange={(event) => update("tags", event.target.value)} />
            </Field>
          </Card>
          <Card>
            <Field label="Featured image" htmlFor="p-image">
              {form.featured_image_url && <img src={form.featured_image_url} alt="" className="mb-2 aspect-video w-full rounded-lg object-cover" />}
              <div className="flex gap-2">
                <Input id="p-image" value={form.featured_image_url} placeholder="https://…" onChange={(event) => update("featured_image_url", event.target.value)} />
                <AdminButton variant="secondary" icon={Images} onClick={() => setPickerOpen(true)} aria-label="Choose from media library" />
              </div>
            </Field>
          </Card>
        </div>
      </form>

      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(url) => update("featured_image_url", url)} />
    </>
  );
}
