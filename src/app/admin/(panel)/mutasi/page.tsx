import { setMutationCategory } from "@/app/actions";
import { all } from "@/lib/db";
import { rp, tgl } from "@/lib/format";
import { getSettings } from "@/lib/logic";
import type { MutationCategory } from "@/lib/types";
import { PdfImporter } from "./PdfImporter";

const CATS: [MutationCategory, string][] = [
  ["donasi", "Donasi"], ["penyaluran", "Penyaluran"], ["operasional", "Operasional"], ["biaya_bank", "Biaya bank"], ["lainnya", "Lainnya"],
];

export default async function AdminMutasi() {
  const [settings, mutations, uploads] = await Promise.all([getSettings(), all("mutations"), all("uploads")]);
  const rows = mutations.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 100);
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Unggah mutasi rekening</h1>
      <p className="mt-2 text-sm text-muted">
        Parser membaca baris berformat <code>tanggal keterangan nominal [DB/CR] saldo</code>. Baru teruji pada satu format bank. Donasi yang menunggu
        transfer otomatis terverifikasi bila ada uang masuk dengan nominal persis sama (termasuk kode unik).
      </p>
      <div className="mt-6"><PdfImporter whitelist={settings.whitelist} /></div>

      <h2 className="mt-12 text-xl font-extrabold">Riwayat unggahan</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {uploads.sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at)).map((u) => (
          <li key={u.id}>{tgl(u.uploaded_at, true)} · rekening {u.source} · {u.count} transaksi</li>
        ))}
      </ul>

      <h2 className="mt-12 text-xl font-extrabold">Kategori transaksi</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
        <table className="tbl min-w-[720px]">
          <thead><tr><th>Tanggal</th><th>Tampil publik</th><th>Masuk</th><th>Keluar</th><th>Kategori</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td className="whitespace-nowrap">{tgl(m.date)}</td>
                <td className="font-mono text-xs">{m.public_desc}</td>
                <td className="whitespace-nowrap">{m.credit ? rp(m.credit) : ""}</td>
                <td className="whitespace-nowrap">{m.debit ? rp(m.debit) : ""}</td>
                <td>
                  <form action={async (f: FormData) => { "use server"; await setMutationCategory(m.id, f.get("category") as MutationCategory); }} className="flex gap-1">
                    <select name="category" defaultValue={m.category} className="rounded-lg border border-line px-2 py-1 text-sm" aria-label="Kategori">
                      {CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="rounded-lg border border-line px-2 text-xs font-bold">Simpan</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
