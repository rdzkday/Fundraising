import { FlowStats } from "@/components/ui";
import { evidenceUrls } from "@/lib/db";
import { rp, tgl } from "@/lib/format";
import { allocate, evidenceOf, type Flow } from "@/lib/logic";
import type { Campaign, Disbursement, Donation, Expense } from "@/lib/types";

type Row = { date: string; at: string; label: string; detail?: string; in: number; out: number };

/** Arus kas satu project: angka utama, detail pencairan beserta bukti, dan buku kas berurutan. */
export async function ProjectFlow({
  campaign,
  flow,
  donations,
  disbursements,
  expenses,
  limit = 30,
}: {
  campaign: Campaign;
  flow: Flow;
  donations: Donation[];
  disbursements: Disbursement[];
  expenses: Expense[];
  limit?: number;
}) {
  const outs = disbursements.filter((d) => d.campaign_id === campaign.id).sort((a, b) => b.date.localeCompare(a.date));
  const costs = expenses.filter((e) => e.campaign_id === campaign.id);
  const verified = donations.filter((d) => d.campaign_id === campaign.id && d.status === "terverifikasi");
  const evidence = await Promise.all(outs.map((o) => evidenceUrls(evidenceOf(o))));

  // Berapa donatur yang ikut membiayai tiap pencairan (hasil pembagian urut masuk).
  const donorsPer = new Map<string, number>();
  for (const list of allocate(campaign, donations, disbursements).values()) {
    for (const a of list) donorsPer.set(a.disbursement.id, (donorsPer.get(a.disbursement.id) ?? 0) + 1);
  }

  const rows: Row[] = [
    ...verified.map((d) => ({ date: (d.verified_at ?? d.created_at).slice(0, 10), at: d.verified_at ?? d.created_at, label: "Donasi masuk", detail: d.name, in: d.total, out: 0 })),
    ...outs.map((o) => ({ date: o.date, at: o.created_at, label: "Pencairan", detail: o.purpose, in: 0, out: o.amount })),
    ...costs.map((e) => ({ date: e.date, at: e.created_at, label: e.kind === "promosi" ? "Promosi" : "Operasional", detail: e.description, in: 0, out: e.amount })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.at.localeCompare(b.at));
  let saldo = 0;
  const ledger = rows.map((r) => ({ ...r, saldo: (saldo += r.in - r.out) })).reverse().slice(0, limit);

  return (
    <div className="space-y-8">
      <FlowStats f={flow} />

      <div>
        <h3 className="text-xl font-extrabold">Detail pencairan ({outs.length})</h3>
        {outs.length === 0 ? (
          <p className="mt-2 text-muted">Belum ada pencairan. Dana tersimpan dan menunggu disalurkan.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
            {outs.map((o, i) => (
              <li key={o.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{o.purpose}</p>
                  <p className="text-xs text-muted">
                    {tgl(o.date)} · dibiayai {donorsPer.get(o.id) ?? 0} donatur
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{rp(o.amount)}</p>
                  {evidence[i].length > 0 ? (
                    evidence[i].map((e, j) => e.url && (
                      <a key={j} href={e.url} target="_blank" rel="noreferrer" className="block text-xs font-bold text-brand-2 underline">
                        {e.caption || (evidence[i].length > 1 ? `Lihat bukti ${j + 1}` : "Lihat bukti")}
                      </a>
                    ))
                  ) : (
                    <span className="text-xs text-warn">Bukti menyusul</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-xl font-extrabold">Buku kas project</h3>
        <p className="mt-1 text-sm text-muted">Semua uang masuk dan keluar project ini, terbaru di atas. Nama donatur sesuai pilihan mereka saat berdonasi.</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
          <table className="tbl min-w-[640px]">
            <thead>
              <tr><th>Tanggal</th><th>Jenis</th><th>Keterangan</th><th className="text-right">Masuk</th><th className="text-right">Keluar</th><th className="text-right">Saldo</th></tr>
            </thead>
            <tbody>
              {ledger.map((r, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap">{tgl(r.date)}</td>
                  <td className="whitespace-nowrap font-semibold">{r.label}</td>
                  <td>{r.detail}</td>
                  <td className="whitespace-nowrap text-right text-brand-2">{r.in ? rp(r.in) : ""}</td>
                  <td className="whitespace-nowrap text-right">{r.out ? rp(r.out) : ""}</td>
                  <td className="whitespace-nowrap text-right font-bold">{rp(r.saldo)}</td>
                </tr>
              ))}
              {ledger.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted">Belum ada transaksi.</td></tr>}
            </tbody>
          </table>
        </div>
        {rows.length > limit && <p className="mt-2 text-xs text-muted">Menampilkan {limit} transaksi terbaru dari {rows.length}.</p>}
      </div>
    </div>
  );
}
