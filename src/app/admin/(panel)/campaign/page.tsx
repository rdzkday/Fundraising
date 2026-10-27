import Link from "next/link";
import { saveCampaign } from "@/app/actions";
import { all } from "@/lib/db";
import { rp, tgl } from "@/lib/format";
import type { CampaignStatus } from "@/lib/types";

const STATUS: [CampaignStatus, string][] = [["pengajuan", "Pengajuan"], ["aktif", "Aktif"], ["selesai", "Selesai"], ["ditolak", "Ditolak"]];

export default async function AdminCampaign() {
  const campaigns = (await all("campaigns")).sort((a, b) => (a.status === "pengajuan" ? -1 : 1) - (b.status === "pengajuan" ? -1 : 1) || b.created_at.localeCompare(a.created_at));
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Campaign</h1>
      <p className="mt-2 text-sm text-muted">Setujui pengajuan dengan mengubah status jadi Aktif. Persen operasional berlaku untuk perhitungan semua donasi di campaign itu.</p>
      <ul className="mt-6 space-y-4">
        {campaigns.map((c) => (
          <li key={c.id} className={`card p-5 ${c.status === "pengajuan" ? "border-warn" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-lg font-bold">{c.title}</p>
                <p className="text-sm text-muted">{c.organizer} · {c.location || "-"} · diajukan {tgl(c.created_at)}{c.contact && ` · ${c.contact}`}</p>
              </div>
              {c.status !== "pengajuan" && <Link href={`/project/${c.slug}`} className="text-sm font-bold text-brand-2 underline">Lihat</Link>}
            </div>
            {c.status === "pengajuan" && c.story && <p className="mt-3 text-sm">{c.story}</p>}
            <form action={saveCampaign.bind(null, c.id)} className="mt-4 flex flex-wrap items-end gap-3 text-sm">
              <label>Status
                <select name="status" defaultValue={c.status} className="mt-1 block rounded-lg border border-line px-2 py-1.5">
                  {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <label>Operasional (%)
                <input name="ops_percent" type="number" min={0} max={30} step="0.5" defaultValue={c.ops_percent} className="mt-1 block w-24 rounded-lg border border-line px-2 py-1.5" />
              </label>
              <label>Target (Rp)
                <input name="target" inputMode="numeric" defaultValue={c.target} className="mt-1 block w-40 rounded-lg border border-line px-2 py-1.5" />
              </label>
              <button className="rounded-lg bg-brand px-4 py-2 font-bold text-lime">Simpan</button>
              <span className="text-xs text-muted">Target saat ini {rp(c.target)}</span>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
