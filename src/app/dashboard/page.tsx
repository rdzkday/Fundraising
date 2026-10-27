import Link from "next/link";
import { Progress, Stat } from "@/components/ui";
import { all } from "@/lib/db";
import { pct, rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";

export const metadata = { title: "Dashboard | dibersamai.id" };

export default async function Dashboard() {
  const [{ campaigns, summary }, uploads, mutations] = await Promise.all([loadAll(), all("uploads"), all("mutations")]);
  const last = uploads.sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))[0];
  const saldo = mutations.sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.balance;
  const active = campaigns.filter((c) => c.status === "aktif" || c.status === "selesai");
  const total = summary.masuk || 1;
  const parts = [
    ["Tersalurkan", summary.tersalurkan, "bg-brand"],
    ["Promosi & operasional", summary.opsUsed, "bg-warn"],
    ["Tersimpan", summary.tersimpan, "bg-lime"],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="chip">Dashboard publik</p>
      <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Aliran dana dibersamai.id</h1>
      <p className="mt-3 text-muted">
        Angka dihitung dari donasi terverifikasi dan mutasi rekening.
        {last && <> Sumber rekening {last.source}, mutasi terakhir diunggah {tgl(last.uploaded_at, true)} WIB.</>}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Uang masuk" value={rp(summary.masuk)} note={`${summary.donors} donasi terverifikasi`} dark />
        <Stat label="Tersimpan" value={rp(summary.tersimpan)} note={saldo !== undefined ? `Saldo rekening di mutasi: ${rp(saldo)}` : undefined} />
        <Stat label="Tersalurkan" value={rp(summary.tersalurkan)} note={`${pct(summary.tersalurkan, summary.masuk)}% dari uang masuk`} />
        <Stat label="Promosi & operasional" value={rp(summary.opsUsed)} note={`Anggaran ${rp(summary.opsBudget)} · sisa ${rp(summary.opsBudget - summary.opsUsed)}`} />
      </div>

      <div className="mt-8 rounded-3xl border border-line p-6">
        <p className="font-bold">Ke mana uang masuk pergi</p>
        <div className="mt-4 flex h-5 overflow-hidden rounded-full bg-mist">
          {parts.map(([label, v, color]) => (
            <div key={label} className={color} style={{ width: `${Math.max(0, (v / total) * 100)}%` }} title={`${label}: ${rp(v)}`} />
          ))}
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {parts.map(([label, v, color]) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              {label} <b>{rp(v)}</b> <span className="text-muted">({pct(v, summary.masuk)}%)</span>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mt-14 text-2xl font-extrabold">Per project</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="tbl min-w-[720px]">
          <thead>
            <tr><th>Project</th><th>Masuk</th><th>Operasional</th><th>Tersalurkan</th><th>Tersimpan</th><th className="w-40">Progres target</th></tr>
          </thead>
          <tbody>
            {active.map((c) => {
              const s = summary.per.get(c.id)!;
              return (
                <tr key={c.id}>
                  <td><Link href={`/project/${c.slug}`} className="font-semibold hover:underline">{c.title}</Link><span className="block text-xs text-muted">{s.donors} donatur · operasional {c.ops_percent}%</span></td>
                  <td>{rp(s.raised)}</td>
                  <td>{rp(s.ops)}</td>
                  <td>{rp(s.disbursed)}</td>
                  <td className="font-bold">{rp(s.raised - s.ops - s.disbursed)}</td>
                  <td><Progress value={s.raised} max={c.target} /><span className="text-xs text-muted">{pct(s.raised, c.target)}% dari {rp(c.target)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm text-muted">
        Rincian mutasi tersensor, daftar penyaluran beserta bukti, dan pemakaian dana operasional ada di{" "}
        <Link href="/pendanaan" className="font-bold text-brand-2 underline underline-offset-4">halaman Pendanaan</Link>.
      </p>
    </div>
  );
}
