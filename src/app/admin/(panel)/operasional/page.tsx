import { addExpense } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import { Submit } from "@/components/client";
import { Stat } from "@/components/ui";
import { rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";

export default async function AdminOperasional() {
  const { campaigns, expenses, summary } = await loadAll();
  const name = new Map(campaigns.map((c) => [c.id, c.title]));
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Promosi & operasional</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Anggaran (persen per donasi)" value={rp(summary.total.budget)} />
        <Stat label="Promosi terpakai" value={rp(summary.total.promosi)} />
        <Stat label="Operasional terpakai" value={rp(summary.total.operasional)} />
        <Stat label="Sisa anggaran" value={rp(summary.total.budget - summary.total.promosi - summary.total.operasional)} dark />
      </div>
      <ActionForm action={addExpense} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="e-k">Jenis</label>
          <select id="e-k" name="kind" className="input"><option value="operasional">Operasional</option><option value="promosi">Promosi</option></select>
        </div>
        <div>
          <label className="label" htmlFor="e-c">Project terkait (opsional)</label>
          <select id="e-c" name="campaign_id" className="input">
            <option value="">Umum</option>
            {campaigns.filter((c) => c.status === "aktif").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="e-d">Keterangan</label>
          <input id="e-d" name="description" className="input" required maxLength={300} placeholder="mis. Iklan Instagram campaign banjir" />
        </div>
        <div>
          <label className="label" htmlFor="e-a">Jumlah (Rp)</label>
          <input id="e-a" name="amount" className="input" inputMode="numeric" required />
        </div>
        <div>
          <label className="label" htmlFor="e-t">Tanggal</label>
          <input id="e-t" name="date" type="date" className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="sm:col-span-2"><Submit>Catat biaya</Submit></div>
      </ActionForm>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
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
    </div>
  );
}
