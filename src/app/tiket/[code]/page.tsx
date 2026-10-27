import Image from "next/image";
import Link from "next/link";
import { CopyButton } from "@/components/client";
import { Progress } from "@/components/ui";
import { all, BUCKET_PUBLIC, fileUrl, one } from "@/lib/db";
import { rp, tgl } from "@/lib/format";
import { allocate, getSettings, opsShare, STATUS_LABEL, viewStatus } from "@/lib/logic";
import { ProofForm } from "./ProofForm";

export const metadata = { title: "Tiket donasi | dibersamai.id", robots: { index: false } };

function Step({ n, title, done, active, children }: { n: number; title: string; done: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <li className="relative flex gap-4 pb-10 last:pb-0">
      <span className="absolute left-[17px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-line" aria-hidden />
      <span className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-extrabold ${done ? "bg-brand text-lime" : active ? "bg-lime text-brand" : "bg-mist text-muted"}`}>
        {done ? "✓" : n}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <p className={`text-lg font-bold ${done || active ? "" : "text-muted"}`}>{title}</p>
        <div className="mt-1 text-sm text-muted">{children}</div>
      </div>
    </li>
  );
}

export default async function TicketPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ baru?: string }> }) {
  const code = decodeURIComponent((await params).code).toUpperCase();
  const fresh = (await searchParams).baru;
  const d = await one("donations", "ticket", code);
  if (!d) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold">Tiket {code} tidak ditemukan</h1>
        <p className="mt-3 text-muted">Periksa lagi penulisan kodenya.</p>
        <Link href="/tiket" className="btn mt-8">Coba lagi</Link>
      </div>
    );
  }
  const [campaign, settings, donations, disbursements] = await Promise.all([
    one("campaigns", "id", d.campaign_id), getSettings(), all("donations"), all("disbursements"),
  ]);
  const status = viewStatus(d);
  const verified = status === "terverifikasi";
  const allocs = campaign && verified ? allocate(campaign, donations, disbursements).get(d.id) ?? [] : [];
  const ops = opsShare(d, campaign ?? undefined);
  const net = d.total - ops;
  const given = allocs.reduce((a, x) => a + x.amount, 0);
  const evidence = await Promise.all(allocs.map((a) => fileUrl(BUCKET_PUBLIC, a.disbursement.evidence_path)));
  const qris = settings.qris_image.startsWith("/") ? settings.qris_image : await fileUrl(BUCKET_PUBLIC, settings.qris_image);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {fresh && status === "menunggu_transfer" && (
        <p className="mb-6 rounded-2xl bg-lime-2 px-5 py-4 font-semibold text-brand">
          Terima kasih! Simpan kode tiket ini untuk melacak donasimu: <span className="font-mono">{d.ticket}</span>
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">Tiket donasi</p>
          <h1 className="flex items-center gap-3 font-mono text-4xl font-bold">
            {d.ticket} <CopyButton text={d.ticket} />
          </h1>
          {campaign && <Link href={`/project/${campaign.slug}`} className="mt-1 block font-semibold text-brand-2 underline underline-offset-4">{campaign.title}</Link>}
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-bold ${verified ? "bg-brand text-lime" : status === "ditolak" || status === "kedaluwarsa" ? "bg-red-50 text-red-700" : "bg-lime-2 text-brand"}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ol>
          <Step n={1} title="Donasi dibuat" done={status !== "menunggu_transfer" && status !== "kedaluwarsa"} active={status === "menunggu_transfer"}>
            <p>{tgl(d.created_at, true)} oleh {d.name}.</p>
            {status === "menunggu_transfer" && (
              <div className="mt-4 space-y-4 rounded-2xl border border-line p-5 text-ink">
                <div>
                  <p className="text-sm text-muted">Transfer tepat sebesar</p>
                  <p className="flex flex-wrap items-center gap-3 text-3xl font-extrabold">
                    {rp(d.total)} <CopyButton text={String(d.total)} label="Salin nominal" />
                  </p>
                  <p className="text-xs text-muted">3 digit terakhir ({String(d.unique_code).padStart(3, "0")}) adalah kode unik untuk mencocokkan transferanmu. Batas waktu: {tgl(d.expires_at, true)} WIB.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div className="rounded-xl bg-mist p-4 text-sm">
                    <p className="text-muted">{settings.bank_name}</p>
                    <p className="flex items-center gap-2 font-mono text-xl font-bold">{settings.bank_account} <CopyButton text={settings.bank_account} /></p>
                    <p>a.n. {settings.bank_holder}</p>
                  </div>
                  {qris && (
                    <div className="text-center text-xs text-muted">
                      <Image src={qris} alt="Kode QRIS dibersamai.id" width={120} height={120} className="rounded-lg border border-line" unoptimized />
                      <p className="mt-1">QRIS, ketik nominal di atas</p>
                    </div>
                  )}
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer font-bold text-brand-2">Sudah transfer tapi status belum berubah? Unggah bukti</summary>
                  <div className="mt-3"><ProofForm ticket={d.ticket} /></div>
                </details>
              </div>
            )}
            {status === "kedaluwarsa" && (
              <div className="mt-3 space-y-3">
                <p>Belum ada transfer yang cocok dalam 24 jam. Kalau kamu sudah transfer, unggah buktinya agar admin memeriksa.</p>
                <ProofForm ticket={d.ticket} />
              </div>
            )}
          </Step>
          <Step n={2} title="Terverifikasi" done={verified} active={status === "menunggu_verifikasi"}>
            {verified && <p>{tgl(d.verified_at, true)}, {d.verified_via === "mutasi" ? "cocok otomatis dengan mutasi rekening" : "diperiksa admin dari bukti transfer"}.</p>}
            {status === "menunggu_verifikasi" && <p>Bukti transfer sudah diterima dan sedang diperiksa admin.</p>}
            {status === "ditolak" && <p className="text-red-700">Transfer tidak ditemukan. Hubungi tim dibersamai.id bila menurutmu ini keliru.</p>}
            {!verified && status !== "menunggu_verifikasi" && status !== "ditolak" && <p>Menunggu transfer masuk.</p>}
          </Step>
          <Step n={3} title="Tersalurkan" done={verified && given >= net} active={verified && given > 0 && given < net}>
            {allocs.length === 0 ? (
              <p>{verified ? "Donasimu tersimpan dan menunggu giliran penyaluran (urut masuk)." : "Setelah terverifikasi."}</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {allocs.map((a) => (
                  <li key={a.disbursement.id} className="rounded-xl bg-mist p-3 text-ink">
                    <b>{rp(a.amount)}</b> ikut dalam: {a.disbursement.purpose}
                    <span className="block text-xs text-muted">{tgl(a.disbursement.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Step>
          <Step n={4} title="Bukti penyaluran" done={evidence.some(Boolean)}>
            {evidence.some(Boolean) ? (
              <ul className="mt-2 space-y-1">
                {allocs.map((a, i) => evidence[i] && (
                  <li key={a.disbursement.id}>
                    <a href={evidence[i]!} target="_blank" rel="noreferrer" className="font-semibold text-brand-2 underline underline-offset-4">
                      Lihat bukti: {a.disbursement.purpose}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Bukti muncul di sini setelah donasimu disalurkan.</p>
            )}
          </Step>
        </ol>

        <aside className="h-fit space-y-4 rounded-3xl bg-mist p-6">
          <p className="font-bold">Rincian donasi</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Nominal</dt><dd>{rp(d.base_amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Kode unik</dt><dd>+{rp(d.unique_code)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 font-bold"><dt>Total donasi</dt><dd>{rp(d.total)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Promosi & operasional ({campaign?.ops_percent ?? 5}%)</dt><dd>{rp(ops)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Untuk program</dt><dd>{rp(net)}</dd></div>
          </dl>
          {verified && (
            <div>
              <Progress value={given} max={net} />
              <p className="mt-2 text-sm"><b>{rp(given)}</b> dari {rp(net)} sudah tersalurkan</p>
            </div>
          )}
          {d.message && <blockquote className="border-l-4 border-lime pl-3 text-sm italic">“{d.message}”</blockquote>}
        </aside>
      </div>
    </div>
  );
}
