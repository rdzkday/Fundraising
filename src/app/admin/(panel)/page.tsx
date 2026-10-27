import Link from "next/link";
import { Stat } from "@/components/ui";
import { isDemo } from "@/lib/db";
import { rp } from "@/lib/format";
import { loadAll, viewStatus } from "@/lib/logic";

export default async function AdminHome() {
  const { campaigns, donations, summary } = await loadAll();
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
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Uang masuk" value={rp(summary.masuk)} dark />
        <Stat label="Tersimpan" value={rp(summary.tersimpan)} />
        <Stat label="Tersalurkan" value={rp(summary.tersalurkan)} />
        <Stat label="Operasional terpakai" value={rp(summary.opsUsed)} note={`dari anggaran ${rp(summary.opsBudget)}`} />
      </div>
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
    </div>
  );
}
