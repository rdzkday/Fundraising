import Link from "next/link";
import { setPriority, verifyDonation } from "@/app/actions";
import { BUCKET_PRIVATE, fileUrl } from "@/lib/db";
import { rp, tgl } from "@/lib/format";
import { loadAll, STATUS_LABEL, viewStatus, type ViewStatus } from "@/lib/logic";

const FILTERS: (ViewStatus | "semua")[] = ["semua", "menunggu_verifikasi", "menunggu_transfer", "terverifikasi", "kedaluwarsa", "ditolak"];

export default async function AdminDonasi({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const status = (await searchParams).status ?? "semua";
  const { campaigns, donations } = await loadAll();
  const name = new Map(campaigns.map((c) => [c.id, c.title]));
  const rows = donations
    .filter((d) => status === "semua" || viewStatus(d) === status)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const proofs = await Promise.all(rows.map((d) => fileUrl(BUCKET_PRIVATE, d.proof_path)));

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Donasi & verifikasi</h1>
      <p className="mt-2 text-sm text-muted">
        Donasi cocok otomatis saat mutasi diunggah. Bukti transfer dari donatur diperiksa di sini. Prioritas lebih tinggi membuat donasi
        tersalurkan lebih dulu (default urut masuk).
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link key={f} href={`/admin/donasi?status=${f}`} className={`rounded-full border px-3 py-1.5 font-semibold ${f === status ? "border-brand bg-lime-2 text-brand" : "border-line"}`}>
            {f === "semua" ? "Semua" : STATUS_LABEL[f]}
          </Link>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
        <table className="tbl min-w-[900px]">
          <thead>
            <tr><th>Tiket</th><th>Donatur</th><th>Campaign</th><th>Total transfer</th><th>Status</th><th>Prioritas</th><th>Tindakan</th></tr>
          </thead>
          <tbody>
            {rows.map((d, i) => {
              const s = viewStatus(d);
              return (
                <tr key={d.id}>
                  <td><Link href={`/tiket/${d.ticket}`} className="font-mono font-bold hover:underline">{d.ticket}</Link><span className="block text-xs text-muted">{tgl(d.created_at, true)}</span></td>
                  <td>{d.name}{d.contact && <span className="block text-xs text-muted">{d.contact}</span>}</td>
                  <td className="max-w-48 text-xs">{name.get(d.campaign_id)}</td>
                  <td className="whitespace-nowrap font-bold">{rp(d.total)}</td>
                  <td>
                    {STATUS_LABEL[s]}
                    {d.verified_via && <span className="block text-xs text-muted">via {d.verified_via}</span>}
                    {proofs[i] && <a href={proofs[i]!} target="_blank" rel="noreferrer" className="block text-xs font-bold text-brand-2 underline">Lihat bukti</a>}
                  </td>
                  <td>
                    {s === "terverifikasi" && (
                      <form action={async (f: FormData) => { "use server"; await setPriority(d.id, Number(f.get("priority")) || 0); }} className="flex gap-1">
                        <input name="priority" type="number" defaultValue={d.priority} className="w-16 rounded-lg border border-line px-2 py-1" aria-label="Prioritas" />
                        <button className="rounded-lg border border-line px-2 text-xs font-bold">Simpan</button>
                      </form>
                    )}
                  </td>
                  <td>
                    {s !== "terverifikasi" && s !== "ditolak" && (
                      <div className="flex gap-1">
                        <form action={verifyDonation.bind(null, d.id, true)}><button className="rounded-lg bg-brand px-3 py-1 text-xs font-bold text-lime">Verifikasi</button></form>
                        <form action={verifyDonation.bind(null, d.id, false)}><button className="rounded-lg border border-line px-3 py-1 text-xs font-bold">Tolak</button></form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted">Tidak ada donasi dengan status ini.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
