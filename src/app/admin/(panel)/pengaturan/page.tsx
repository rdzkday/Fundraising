import { saveSettings } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import { Submit } from "@/components/client";
import { getSettings } from "@/lib/logic";

export default async function AdminPengaturan() {
  const s = await getSettings();
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Pengaturan</h1>
      <ActionForm action={saveSettings} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <p className="font-bold sm:col-span-2">Rekening penerima donasi</p>
        <div>
          <label className="label" htmlFor="s-b">Nama bank</label>
          <input id="s-b" name="bank_name" className="input" defaultValue={s.bank_name} />
        </div>
        <div>
          <label className="label" htmlFor="s-a">Nomor rekening</label>
          <input id="s-a" name="bank_account" className="input" defaultValue={s.bank_account} />
        </div>
        <div>
          <label className="label" htmlFor="s-h">Atas nama</label>
          <input id="s-h" name="bank_holder" className="input" defaultValue={s.bank_holder} />
        </div>
        <div>
          <label className="label" htmlFor="s-q">Gambar QRIS statis (ganti)</label>
          <input id="s-q" name="qris" type="file" accept="image/png,image/jpeg,image/webp" className="input text-sm" />
        </div>
        <div>
          <label className="label" htmlFor="s-o">Persen operasional default campaign baru</label>
          <input id="s-o" name="default_ops_percent" type="number" min={0} max={30} step="0.5" className="input" defaultValue={s.default_ops_percent} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="s-w">Whitelist sensor mutasi</label>
          <textarea id="s-w" name="whitelist" className="input min-h-32 font-mono text-sm" defaultValue={s.whitelist.join(" ")} />
          <p className="mt-1 text-xs text-muted">Hanya kata di daftar ini yang tampil ke publik. Kata lain (nama, nomor, kode) diganti ███. Berlaku untuk unggahan berikutnya.</p>
        </div>
        <div className="sm:col-span-2"><Submit>Simpan pengaturan</Submit></div>
      </ActionForm>
    </div>
  );
}
