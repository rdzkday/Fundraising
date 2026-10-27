import Link from "next/link";
import { FlowStats, Progress } from "@/components/ui";
import { all } from "@/lib/db";
import { pct, rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";

export const metadata = { title: "Dashboard | dibersamai.id" };

export default async function Dashboard() {
  const [{ campaigns, summary }, uploads] = await Promise.all([loadAll(), all("uploads")]);
  const last = uploads.sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))[0];
  const t = summary.total;
  const active = campaigns.filter((c) => c.status === "aktif" || c.status === "selesai");
  const parts = [
    ["Tersalurkan", t.tersalurkan, "bg-brand"],
    ["Promosi", t.promosi, "bg-warn"],
    ["Operasional", t.operasional, "bg-amber-300"],
    ["Tersimpan", t.tersimpan, "bg-lime"],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="chip">Dashboard publik</p>
      <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Aliran dana dibersamai.id</h1>
      <p className="mt-3 text-muted">
        Angka dihitung dari donasi terverifikasi, pencairan, dan biaya yang dicatat.
        {last && <> Mutasi rekening {last.source} terakhir diunggah {tgl(last.uploaded_at, true)} WIB.</>}
      </p>

      <div className="mt-10"><FlowStats f={t} /></div>

      <div className="mt-6 rounded-3xl border border-line p-6">
        <p className="font-bold">Ke mana uang masuk pergi</p>
        <div className="mt-4 flex h-5 overflow-hidden rounded-full bg-mist">
          {parts.map(([label, v, color]) => (
            <div key={label} className={color} style={{ width: `${Math.max(0, (v / (t.masuk || 1)) * 100)}%` }} title={`${label}: ${rp(v)}`} />
          ))}
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {parts.map(([label, v, color]) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              {label} <b>{rp(v)}</b> <span className="text-muted">({pct(v, t.masuk)}%)</span>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mt-14 text-2xl font-extrabold">Per project</h2>
      <p className="mt-1 text-sm text-muted">Klik project untuk melihat detail pencairan, bukti, dan buku kasnya.</p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="tbl min-w-[860px]">
          <thead>
            <tr><th>Project</th><th>Masuk</th><th>Tersalurkan</th><th>Promosi</th><th>Operasional</th><th>Tersimpan</th><th className="w-36">Target</th><th /></tr>
          </thead>
          <tbody>
            {active.map((c) => {
              const s = summary.per.get(c.id)!;
              return (
                <tr key={c.id} className="relative cursor-pointer transition hover:bg-mist">
                  <td>
                    <Link href={`/project/${c.slug}#pencairan`} className="font-semibold after:absolute after:inset-0">{c.title}</Link>
                    <span className="block text-xs text-muted">{s.donors} donatur</span>
                  </td>
                  <td>{rp(s.masuk)}</td>
                  <td>{rp(s.tersalurkan)}</td>
                  <td>{rp(s.promosi)}</td>
                  <td>{rp(s.operasional)}</td>
                  <td className="font-bold">{rp(s.tersimpan)}</td>
                  <td><Progress value={s.masuk} max={c.target} /><span className="text-xs text-muted">{pct(s.masuk, c.target)}% dari {rp(c.target)}</span></td>
                  <td className="text-right font-bold text-brand-2">Detail →</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {t.operasional + t.promosi > [...summary.per.values()].reduce((a, s) => a + s.promosi + s.operasional, 0) && (
        <p className="mt-3 text-xs text-muted">Sebagian biaya bersifat umum (lintas project), sehingga hanya tercatat di total keseluruhan.</p>
      )}
    </div>
  );
}
