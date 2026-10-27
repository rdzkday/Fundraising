"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

/** Status kirim dari ActionForm. Di luar ActionForm, Submit memakai useFormStatus. */
export const PendingContext = createContext<boolean | null>(null);

export function Submit({ children, className = "btn" }: { children: React.ReactNode; className?: string }) {
  const fromForm = useContext(PendingContext);
  const status = useFormStatus();
  const pending = fromForm ?? status.pending;
  return (
    <button className={className} disabled={pending}>
      {pending ? "Memproses..." : children}
    </button>
  );
}

export function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="rounded-full border border-line px-3 py-1 text-xs font-bold hover:border-brand"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Tersalin" : label}
    </button>
  );
}

/**
 * Foto dari kamera HP bisa 3-5 MB, sedangkan Vercel menolak kiriman di atas 4,5 MB.
 * Foto diperkecil ke sisi terpanjang 1600 px (JPEG) sebelum dikirim. PDF dibiarkan.
 */
async function shrinkImage(file: File, max = 1600): Promise<File> {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type) || file.size < 400_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; // PNG transparan jadi latar putih di JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

type EvidenceRow = { id: number; preview: string | null; name: string };
let rowId = 0;

/** Baris bukti dinamis: tiap baris satu file + keterangan. Dikirim sebagai `evidence` dan `caption` berurutan. */
export function EvidenceFields({ initial = 0 }: { initial?: number }) {
  const [rows, setRows] = useState<EvidenceRow[]>(() => Array.from({ length: initial }, () => ({ id: ++rowId, preview: null, name: "" })));
  useEffect(() => () => rows.forEach((r) => r.preview && URL.revokeObjectURL(r.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const patch = (id: number, next: Partial<EvidenceRow>) => setRows((list) => list.map((r) => (r.id === id ? { ...r, ...next } : r)));
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.id} className="flex flex-wrap items-start gap-3 rounded-xl border border-line bg-mist/50 p-3">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white text-[10px] font-bold text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.preview ? <img src={r.preview} alt="" className="size-full object-cover" /> : r.name ? "PDF" : `#${i + 1}`}
          </div>
          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
            <input
              type="file"
              name="evidence"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              aria-label={`File bukti ${i + 1}`}
              className="input py-2 text-sm"
              required
              onChange={async (e) => {
                const input = e.target;
                const picked = input.files?.[0];
                if (r.preview) URL.revokeObjectURL(r.preview);
                const file = picked ? await shrinkImage(picked) : undefined;
                if (file && file !== picked) {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  input.files = dt.files;
                }
                patch(r.id, { name: file?.name ?? "", preview: file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
              }}
            />
            <input name="caption" className="input py-2 text-sm" required maxLength={200} placeholder="Keterangan, mis. Kuitansi honor psikolog" aria-label={`Keterangan bukti ${i + 1}`} />
          </div>
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-2 text-xs font-bold text-muted hover:border-ink/40 hover:text-ink"
            onClick={() => {
              if (r.preview) URL.revokeObjectURL(r.preview);
              setRows((list) => list.filter((x) => x.id !== r.id));
            }}
          >
            Hapus
          </button>
        </div>
      ))}
      <button
        type="button"
        className="rounded-full border border-dashed border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-lime-2"
        onClick={() => setRows((list) => [...list, { id: ++rowId, preview: null, name: "" }])}
      >
        + Tambah bukti
      </button>
    </div>
  );
}
