import Image from "next/image";
import Link from "next/link";
import { ProjectFlow } from "@/components/ProjectFlow";
import { all } from "@/lib/db";
import { rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";
import { ProposeForm } from "./ProposeForm";

export const metadata = { title: "Pendanaan | dibersamai.id" };

const CAT: Record<string, string> = {
  donasi: "Donasi", penyaluran: "Penyaluran", operasional: "Operasional", biaya_bank: "Biaya bank", lainnya: "Lainnya",
};

export default async function Pendanaan() {
  const [{ campaigns, donations, disbursements, expenses, summary }, mutations] = await Promise.all([loadAll(), all("mutations")]);
  const active = campaigns.filter((c) => c.status === "aktif" || c.status === "selesai");
  const general = expenses.filter((e) => !e.campaign_id).sort((a, b) => b.date.localeCompare(a.date));
  const muts = [...mutations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="chip">Pendanaan</p>
      <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Arus kas per project</h1>
      <p className="mt-3 max-w-2xl text-muted">Setiap project punya buku kasnya sendiri: uang masuk, pencairan beserta bukti, promosi, operasional, dan saldo yang tersimpan.</p>
      <nav className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
        {active.map((c) => (
          <a key={c.id} href={`#${c.slug}`} className="rounded-full border border-line px-4 py-2 hover:border-brand">{c.category}</a>
        ))}
        <a href="#galang" className="rounded-full bg-lime-2 px-4 py-2 text-brand">Galang dana</a>
      </nav>

      {active.map((c) => (
        <section key={c.id} id={c.slug} className="scroll-mt-24 border-t border-line pt-10 mt-12 first-of-type:border-0">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
              <Image src={c.image} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-2">{c.category} · {c.location}</p>
              <h2 className="text-2xl font-extrabold">{c.title}</h2>
            </div>
            <Link href={`/project/${c.slug}`} className="btn-ghost px-4 py-2 text-sm">Buka project</Link>
          </div>
          <ProjectFlow campaign={c} flow={summary.per.get(c.id)!} donations={donations} disbursements={disbursements} expenses={expenses} limit={8} />
        </section>
      ))}

      {general.length > 0 && (
        <section className="mt-12 border-t border-line pt-10">
          <h2 className="text-2xl font-extrabold">Biaya umum lintas project</h2>
          <p className="mt-1 text-sm text-muted">Biaya yang tidak terkait satu project tertentu, misalnya server dan domain.</p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="tbl min-w-[560px]">
              <thead><tr><th>Tanggal</th><th>Jenis</th><th>Keterangan</th><th className="text-right">Jumlah</th></tr></thead>
              <tbody>
                {general.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap">{tgl(e.date)}</td>
                    <td className="capitalize">{e.kind}</td>
                    <td>{e.description}</td>
                    <td className="whitespace-nowrap text-right font-bold">{rp(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <details className="mt-12 rounded-2xl border border-line p-5">
        <summary className="cursor-pointer font-bold">Mutasi rekening tersensor (semua project, 50 terbaru)</summary>
        <div className="mt-4 overflow-x-auto">
          <table className="tbl min-w-[640px]">
            <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th className="text-right">Masuk</th><th className="text-right">Keluar</th></tr></thead>
            <tbody>
              {muts.map((m) => (
                <tr key={m.id}>
                  <td className="whitespace-nowrap">{tgl(m.date)}</td>
                  <td className="font-mono text-xs">{m.public_desc}</td>
                  <td>{CAT[m.category]}</td>
                  <td className="whitespace-nowrap text-right text-brand-2">{m.credit ? rp(m.credit) : ""}</td>
                  <td className="whitespace-nowrap text-right">{m.debit ? rp(m.debit) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <section id="galang" className="scroll-mt-24 pt-16">
        <div className="rounded-3xl bg-mist p-6 md:p-10">
          <p className="chip">Galang dana</p>
          <h2 className="mt-3 text-3xl font-extrabold">Ajukan campaign pemulihan</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Untuk lembaga atau komunitas yang mendampingi penyintas. Pengajuan diverifikasi tim dibersamai.id sebelum tayang, dan campaign wajib
            mengikuti standar transparansi yang sama.
          </p>
          <div className="mt-8"><ProposeForm /></div>
        </div>
      </section>
    </div>
  );
}
