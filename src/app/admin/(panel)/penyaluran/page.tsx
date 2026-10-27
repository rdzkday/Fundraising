import { addDisbursement, addEvidence } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import { Submit } from "@/components/client";
import { rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";

export default async function AdminPenyaluran() {
  const { campaigns, disbursements, summary } = await loadAll();
  const name = new Map(campaigns.map((c) => [c.id, c.title]));
  const active = campaigns.filter((c) => c.status === "aktif" || c.status === "selesai");
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Penyaluran</h1>
      <p className="mt-2 text-sm text-muted">Penyaluran dibagi otomatis ke donasi terverifikasi secara urut masuk. Atur prioritas di halaman Donasi.</p>
      <ActionForm action={addDisbursement} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="d-c">Project</label>
          <select id="d-c" name="campaign_id" className="input" required>
            {active.map((c) => {
              const s = summary.per.get(c.id)!;
              return <option key={c.id} value={c.id}>{c.title} (tersimpan {rp(s.raised - s.ops - s.disbursed)})</option>;
            })}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="d-p">Tujuan penyaluran</label>
          <input id="d-p" name="purpose" className="input" required maxLength={300} placeholder="mis. Honor psikolog untuk 10 sesi konseling" />
        </div>
        <div>
          <label className="label" htmlFor="d-a">Jumlah (Rp)</label>
          <input id="d-a" name="amount" className="input" inputMode="numeric" required />
        </div>
        <div>
          <label className="label" htmlFor="d-d">Tanggal</label>
          <input id="d-d" name="date" type="date" className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="d-e">Bukti (foto, kuitansi, laporan)</label>
          <input id="d-e" name="evidence" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="input text-sm" />
          <p className="mt-1 text-xs text-muted">Bukti tampil ke publik. Pastikan tidak memuat data pribadi penerima (wajah anak, NIK, nomor rekening).</p>
        </div>
        <div className="sm:col-span-2"><Submit>Simpan penyaluran</Submit></div>
      </ActionForm>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
        <table className="tbl min-w-[720px]">
          <thead><tr><th>Tanggal</th><th>Project</th><th>Tujuan</th><th>Jumlah</th><th>Bukti</th></tr></thead>
          <tbody>
            {[...disbursements].sort((a, b) => b.date.localeCompare(a.date)).map((d) => (
              <tr key={d.id}>
                <td className="whitespace-nowrap">{tgl(d.date)}</td>
                <td className="max-w-48 text-xs">{name.get(d.campaign_id)}</td>
                <td>{d.purpose}</td>
                <td className="whitespace-nowrap font-bold">{rp(d.amount)}</td>
                <td>
                  {d.evidence_path ? "Ada" : (
                    <form action={addEvidence.bind(null, d.id)} className="flex gap-1">
                      <input type="file" name="evidence" required accept="image/png,image/jpeg,image/webp,application/pdf" className="w-44 text-xs" aria-label="Bukti" />
                      <button className="rounded-lg border border-line px-2 text-xs font-bold">Unggah</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
