import { addDisbursement, addEvidence } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import { EvidenceFields, Submit } from "@/components/client";
import { Stat, Statement } from "@/components/ui";
import { evidenceUrls } from "@/lib/db";
import { rp, tgl } from "@/lib/format";
import { evidenceOf, isImage, loadAll } from "@/lib/logic";

export default async function AdminPenyaluran() {
  const { campaigns, disbursements, summary } = await loadAll();
  const name = new Map(campaigns.map((c) => [c.id, c.title]));
  const active = campaigns.filter((c) => c.status === "aktif" || c.status === "selesai");
  const list = [...disbursements].sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
  const t = summary.total;
  const proofs = await Promise.all(list.map((d) => evidenceUrls(evidenceOf(d))));
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Penyaluran</h1>
      <p className="mt-2 text-sm text-muted">Penyaluran dibagi otomatis ke donasi terverifikasi secara urut masuk. Atur prioritas di halaman Donasi.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Dana masuk (terverifikasi)" value={rp(t.masuk)} note={`${t.donors} donasi`} />
        <Stat label="Promosi & operasional" value={rp(t.promosi + t.operasional)} />
        <Stat label="Sudah disalurkan" value={rp(t.tersalurkan)} note={`${list.length} penyaluran`} />
        <Stat label="Sisa dana" value={rp(t.tersimpan)} note="Siap disalurkan" dark />
      </div>
      <ActionForm action={addDisbursement} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="d-c">Project</label>
          <select id="d-c" name="campaign_id" className="input" required>
            {active.map((c) => {
              const s = summary.per.get(c.id)!;
              return <option key={c.id} value={c.id}>{c.title} (tersimpan {rp(s.tersimpan)})</option>;
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
        <fieldset className="sm:col-span-2">
          <legend className="label">Bukti (foto, kuitansi, laporan)</legend>
          <p className="mb-3 text-xs text-muted">
            Tambah satu baris per file, lalu isi keterangannya. JPG, PNG, WEBP, atau PDF, maks. 5 MB per file. Bukti tampil ke publik. Pastikan tidak memuat data pribadi penerima (wajah anak, NIK, nomor rekening).
          </p>
          <EvidenceFields />
        </fieldset>
        <Statement className="sm:col-span-2" />
        <div className="sm:col-span-2"><Submit>Simpan penyaluran</Submit></div>
      </ActionForm>

      <h2 className="mt-10 text-xl font-extrabold">Riwayat penyaluran ({list.length})</h2>
      <ul className="mt-3 space-y-4">
        {list.map((d, i) => (
          <li key={d.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">{tgl(d.date)} · {name.get(d.campaign_id)}</p>
                <p className="mt-1 font-semibold">{d.purpose}</p>
              </div>
              <p className="whitespace-nowrap text-lg font-extrabold">{rp(d.amount)}</p>
            </div>

            <p className="mt-4 text-sm font-semibold">Bukti ({proofs[i].length})</p>
            {proofs[i].length === 0 ? (
              <p className="mt-1 text-sm text-warn">Belum ada bukti.</p>
            ) : (
              <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {proofs[i].map((e, j) => (
                  <li key={j}>
                    <a href={e.url ?? undefined} target="_blank" rel="noreferrer" className="group block">
                      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-line bg-mist">
                        {e.url && isImage(e.path) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.url} alt={e.caption || `Bukti ${j + 1}`} className="size-full object-cover transition group-hover:scale-105" />
                        ) : (
                          <span className="text-xs font-bold text-muted">PDF</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-snug group-hover:underline">{e.caption || `Bukti ${j + 1}`}</p>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-bold text-brand-2">Tambah bukti</summary>
              <ActionForm action={addEvidence.bind(null, d.id)} className="mt-3 space-y-3">
                <EvidenceFields initial={1} />
                <Statement />
                <Submit className="btn px-5 py-2 text-sm">Unggah bukti</Submit>
              </ActionForm>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
