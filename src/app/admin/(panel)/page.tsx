import Link from "next/link";
import { FlowStats } from "@/components/ui";
import { all, isDemo } from "@/lib/db";
import { tgl } from "@/lib/format";
import { loadAll, viewStatus } from "@/lib/logic";

export default async function AdminHome() {
  const [{ campaigns, donations, summary }, inquiries] = await Promise.all([loadAll(), all("inquiries")]);
  const waiting = donations.filter((d) => viewStatus(d) === "menunggu_verifikasi").length;
  const pendingTransfer = donations.filter((d) => viewStatus(d) === "menunggu_transfer").length;
  const proposals = campaigns.filter((c) => c.status === "pengajuan").length;
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Ringkasan</h1>
      {isDemo && (
        <p className="mt-3 rounded-xl bg-lime-2 px-4 py-3 text-sm text-brand">
          Mode demo: perubahan tersimpan di memori server dan hilang saat server dimatikan. Isi kunci Supabase di <code>.env.local</code> untuk menyimpan permanen.
        </p>
      )}
      <div className="mt-6"><FlowStats f={summary.total} /></div>
      <h2 className="mt-10 text-xl font-extrabold">Perlu tindakan</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          [`${waiting} bukti transfer`, "menunggu dicek", "/admin/donasi?status=menunggu_verifikasi"],
          [`${pendingTransfer} donasi`, "menunggu transfer (cocokkan lewat unggah mutasi)", "/admin/mutasi"],
          [`${proposals} pengajuan campaign`, "menunggu persetujuan", "/admin/campaign"],
        ].map(([a, b, href]) => (
          <li key={href}>
            <Link href={href} className="card block p-5 hover:border-brand">
              <p className="text-2xl font-extrabold">{a}</p>
              <p className="text-sm text-muted">{b}</p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-extrabold">Pengajuan kolaborasi audit ({inquiries.length})</h2>
      {inquiries.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Belum ada. Auditor bisa mengajukan lewat halaman Tentang Kami.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {inquiries.sort((a, b) => b.created_at.localeCompare(a.created_at)).map((q) => (
            <li key={q.id} className="card p-5">
              <p className="font-bold">{q.name} · {q.organization}</p>
              <p className="text-sm text-muted">{q.contact} · {tgl(q.created_at, true)}</p>
              {q.message && <p className="mt-2 text-sm">{q.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
