import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Check, Copy, FileText, Images, Trash, Upload } from "lucide-react";
import { deleteMedia, listMedia, uploadMedia } from "@/admin/api";
import { useAuth } from "@/admin/auth/AuthProvider";
import { AdminButton, Badge, Card, ConfirmDialog, EmptyState, ErrorState, Modal, PageHeader, SearchInput, Select, Skeleton, useToast } from "@/admin/components/ui";
import { formatBytes, formatDate, useAsync } from "@/admin/utils";
import { errorMessage } from "@/lib/supabase";
import type { MediaKind, MediaRow } from "@/lib/types";
import { cn } from "@/utils/cn";

const kinds: { key: MediaKind; label: string }[] = [
  { key: "image", label: "Website image" },
  { key: "blog", label: "Blog image" },
  { key: "logo", label: "Logo" },
  { key: "favicon", label: "Favicon" },
  { key: "document", label: "Document" },
];

const MAX_MEDIA_SIZE = 10 * 1024 * 1024;
const isImage = (item: MediaRow) => (item.mime_type ?? "").startsWith("image/");

function MediaTile({ item, onSelect, onDelete, selectable }: { item: MediaRow; onSelect?: (item: MediaRow) => void; onDelete?: (item: MediaRow) => void; selectable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!item.public_url) return;
    try {
      await navigator.clipboard.writeText(item.public_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={cn("group overflow-hidden rounded-xl border border-[#E3EAF3] bg-white", selectable && "cursor-pointer transition-shadow hover:shadow-md hover:ring-2 hover:ring-royal/40")} onClick={selectable && onSelect ? () => onSelect(item) : undefined}>
      <div className="flex aspect-[4/3] items-center justify-center bg-[#F4F7FB]">
        {isImage(item) && item.public_url ? <img src={item.public_url} alt={item.alt_text ?? item.file_name} className="h-full w-full object-cover" loading="lazy" /> : <FileText className="h-8 w-8 text-slate-400" />}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-ink" title={item.file_name}>
          {item.file_name}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {(item.mime_type ?? "file").split("/").pop()?.toUpperCase()} · {formatBytes(item.size_bytes)} · {formatDate(item.created_at)}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <Badge tone="navy">{kinds.find((kind) => kind.key === item.kind)?.label ?? item.kind}</Badge>
          {!selectable && (
            <div className="flex items-center gap-1">
              <AdminButton variant="ghost" size="xs" icon={copied ? Check : Copy} onClick={() => void copy()} aria-label="Copy URL">
                {copied ? "Copied" : "URL"}
              </AdminButton>
              {onDelete && <AdminButton variant="ghost" size="xs" icon={Trash} onClick={() => onDelete(item)} aria-label="Delete" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function useMediaUpload(onDone: () => void) {
  const toast = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList, kind: MediaKind) => {
    if (!user) return;
    setUploading(true);
    let success = 0;
    for (const file of Array.from(files)) {
      if (file.size > MAX_MEDIA_SIZE) {
        toast({ title: `${file.name} is larger than 10 MB`, tone: "error" });
        continue;
      }
      try {
        await uploadMedia(file, kind, user.id);
        success += 1;
      } catch (issue) {
        toast({ title: `Upload failed: ${file.name}`, description: errorMessage(issue), tone: "error" });
      }
    }
    if (success) toast({ title: `${success} file(s) uploaded` });
    setUploading(false);
    onDone();
  };
  return { upload, uploading };
}

export function MediaPage() {
  const { can } = useAuth();
  const toast = useToast();
  const query = useAsync(listMedia, []);
  const [kind, setKind] = useState<MediaKind>("image");
  const [filter, setFilter] = useState<MediaKind | "">("");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<MediaRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useMediaUpload(() => void query.refetch(true));

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data ?? []).filter((item) => (!filter || item.kind === filter) && (!term || item.file_name.toLowerCase().includes(term)));
  }, [query.data, filter, search]);

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteMedia(toDelete);
      toast({ title: "File deleted" });
      setToDelete(null);
      await query.refetch(true);
    } catch (issue) {
      toast({ title: "Delete failed", description: errorMessage(issue), tone: "error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Website"
        title="Media Library"
        description="Logos, favicons, website and blog images, and documents."
        actions={
          can("media.manage") && (
            <div className="flex items-center gap-2">
              <Select value={kind} onChange={(event) => setKind(event.target.value as MediaKind)} className="w-40" aria-label="Upload as">
                {kinds.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </Select>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  if (event.target.files?.length) void upload(event.target.files, kind);
                  event.target.value = "";
                }}
              />
              <AdminButton icon={Upload} loading={uploading} onClick={() => inputRef.current?.click()}>
                Upload
              </AdminButton>
            </div>
          )
        }
      />
      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-[#E3EAF3] p-4 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search files…" className="sm:w-72" />
          <Select value={filter} onChange={(event) => setFilter(event.target.value as MediaKind | "")} className="sm:w-44" aria-label="Filter by type">
            <option value="">All types</option>
            {kinds.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-500 sm:ml-auto">Max 10 MB per file · images and PDFs</p>
        </div>
        {query.error ? (
          <ErrorState message={query.error} onRetry={() => void query.refetch()} />
        ) : query.loading && !query.data ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-52" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Images} title="No media yet" description="Upload your logo, favicon and website images to use them across the site." />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <MediaTile key={item.id} item={item} onDelete={can("media.delete") ? setToDelete : undefined} />
            ))}
          </div>
        )}
      </Card>
      <ConfirmDialog open={Boolean(toDelete)} title="Delete file?" message={<p>{toDelete?.file_name} will be permanently removed from storage. Pages using this URL will show a broken image.</p>} confirmLabel="Delete" loading={deleting} onCancel={() => setToDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}

/** Reusable image picker used by the services and blog editors. */
export function MediaPickerModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (url: string) => void }) {
  const query = useAsync(listMedia, [open]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { can } = useAuth();
  const { upload, uploading } = useMediaUpload(() => void query.refetch(true));
  const images = (query.data ?? []).filter(isImage);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose an image"
      description="Select from the media library or upload a new image."
      size="xl"
      footer={
        <>
          {can("media.manage") && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  if (event.target.files?.length) void upload(event.target.files, "image");
                  event.target.value = "";
                }}
              />
              <AdminButton variant="secondary" icon={Upload} loading={uploading} onClick={() => inputRef.current?.click()}>
                Upload image
              </AdminButton>
            </>
          )}
          <AdminButton variant="ghost" onClick={onClose}>
            Close
          </AdminButton>
        </>
      }
    >
      {query.loading && !query.data ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <EmptyState compact icon={Images} title="No images in the library" description="Upload an image to use it here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {images.map((item) => (
            <MediaTile
              key={item.id}
              item={item}
              selectable
              onSelect={(selected) => {
                if (selected.public_url) onSelect(selected.public_url);
                onClose();
              }}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
