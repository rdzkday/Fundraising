import Link from "next/link";
import { all, BUCKET_PUBLIC, fileUrl } from "@/lib/db";
import { rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";
import { ProposeForm } from "./ProposeForm";

export const metadata = { title: "Pendanaan | dibersamai.id" };

const CAT: Record<string, string> = {
  donasi: "Donasi", penyaluran: "Penyaluran", operasional: "Operasional", biaya_bank: "Biaya bank", lainnya: "Lainnya",
};

export default async function Pendanaan() {
  const [{ campaigns, disbursements, expenses, summary }, mutations] = await Promise.all([loadAll(), all("mutations")]);
  const name = new Map(campaigns.map((c) => [c.id, c.title]));
  const outs = [...disbursements].sort((a, b) => b.date.localeCompare(a.date));
  const evidence = await Promise.all(outs.map((o) => fileUrl(BUCKET_PUBLIC, o.evidence_path)));
  const muts = [...mutations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="chip">Pendanaan</p>
      <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Rincian aliran dana</h1>
      <nav className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
        {[["#penyaluran", "Penyaluran & bukti"], ["#operasional", "Operasional"], ["#mutasi", "Mutasi rekening"], ["#galang", "Galang dana"]].map(([h, l]) => (
          <a key={h} href={h} className="rounded-full border border-line px-4 py-2 hover:border-brand">{l}</a>
        ))}
      </nav>

      <section id="penyaluran" className="scroll-mt-24 pt-12">
        <h2 className="text-2xl font-extrabold">Penyaluran dan bukti</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="tbl min-w-[640px]">
            <thead><tr><th>Tanggal</th><th>Project</th><th>Tujuan</th><th>Jumlah</th><th>Bukti</th></tr></thead>
            <tbody>
              {outs.map((o, i) => (
                <tr key={o.id}>
                  <td className="whitespace-nowrap">{tgl(o.date)}</td>
                  <td>{name.get(o.campaign_id)}</td>
                  <td>{o.purpose}</td>
                  <td className="whitespace-nowrap font-bold">{rp(o.amount)}</td>
                  <td>{evidence[i] ? <a href={evidence[i]!} target="_blank" rel="noreferrer" className="font-bold text-brand-2 underline">Lihat</a> : <span className="text-warn">Menyusul</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="operasional" className="scroll-mt-24 pt-12">
        <h2 className="text-2xl font-extrabold">Promosi dan operasional</h2>
        <p className="mt-2 text-muted">
          Setiap donasi menyisihkan persentase yang diumumkan di halaman project. Total anggaran saat ini {rp(summary.opsBudget)}, terpakai {rp(summary.opsUsed)}, sisa {rp(summary.opsBudget - summary.opsUsed)}.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="tbl min-w-[560px]">
            <thead><tr><th>Tanggal</th><th>Jenis</th><th>Keterangan</th><th>Jumlah</th></tr></thead>
            <tbody>
              {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap">{tgl(e.date)}</td>
                  <td className="capitalize">{e.kind}</td>
                  <td>{e.description}{e.campaign_id && <span className="block text-xs text-muted">{name.get(e.campaign_id)}</span>}</td>
                  <td className="whitespace-nowrap font-bold">{rp(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="mutasi" className="scroll-mt-24 pt-12">
        <h2 className="text-2xl font-extrabold">Mutasi rekening (tersensor)</h2>
        <p className="mt-2 text-muted">Nama, nomor rekening, dan kode transaksi diganti ███ di perangkat admin sebelum data diunggah. 50 transaksi terbaru.</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
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
      </section>

      <section id="galang" className="scroll-mt-24 pt-16">
        <div className="rounded-3xl bg-mist p-6 md:p-10">
          <p className="chip">Galang dana</p>
          <h2 className="mt-3 text-3xl font-extrabold">Ajukan campaign pemulihan</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Untuk lembaga atau komunitas yang mendampingi penyintas. Pengajuan diverifikasi tim dibersamai.id sebelum tayang, dan campaign wajib
            mengikuti standar transparansi yang sama. Lihat contoh di <Link href="/project" className="font-bold underline">Project</Link>.
          </p>
          <div className="mt-8"><ProposeForm /></div>
        </div>
      </section>
    </div>
  );
}
