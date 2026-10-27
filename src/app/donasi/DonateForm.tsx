"use client";

import { useActionState, useState } from "react";
import { donate } from "@/app/actions";
import { Submit } from "@/components/client";
import { Notice } from "@/components/ui";
import { rp } from "@/lib/format";

type Opt = { id: string; title: string; ops: number };
const PRESETS = [25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

export function DonateForm({ campaigns, initial }: { campaigns: Opt[]; initial?: string }) {
  const [state, action] = useActionState(donate, null);
  const [campaign, setCampaign] = useState(initial ?? campaigns[0]?.id);
  const [amount, setAmount] = useState(100_000);
  const [custom, setCustom] = useState("");
  const [anon, setAnon] = useState(false);
  const value = custom ? Number(custom.replace(/\D/g, "")) : amount;
  const ops = campaigns.find((c) => c.id === campaign)?.ops ?? 5;

  return (
    <form action={action} className="space-y-7">
      <div>
        <label className="label" htmlFor="campaign">Campaign yang ingin didukung</label>
        <select id="campaign" name="campaign_id" className="input" value={campaign} onChange={(e) => setCampaign(e.target.value)}>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label">Nominal donasi</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setAmount(p); setCustom(""); }}
              className={`rounded-xl border px-3 py-3 font-bold tabular-nums transition ${!custom && amount === p ? "border-brand bg-lime-2 text-brand" : "border-line hover:border-ink/40"}`}
            >
              {rp(p)}
            </button>
          ))}
        </div>
        <div className="relative mt-3">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted">Rp</span>
          <input
            className={`input pl-12 text-lg font-bold tabular-nums placeholder:font-semibold ${custom ? "border-brand ring-2 ring-lime" : ""}`}
            inputMode="numeric"
            placeholder="Nominal lain"
            value={custom ? Number(custom.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
            onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 10))}
            aria-label="Nominal lain"
          />
        </div>
        <input type="hidden" name="amount" value={value || 0} />
        <p className="mt-3 max-w-prose rounded-xl bg-mist px-4 py-3 text-sm leading-relaxed text-muted">
          Setelah klik Donate, sistem menambahkan <b>kode unik 3 digit</b> (mis. {rp(value + 123)}). Kode ini dipakai untuk mencocokkan
          transferanmu dan ikut dihitung sebagai donasi. {ops}% dialokasikan untuk promosi & operasional, dan pemakaiannya ditampilkan terbuka di dashboard.
        </p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nama</label>
          <input id="name" name="name" className="input" placeholder="Nama yang ditampilkan" disabled={anon} maxLength={60} />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" name="anonymous" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> Sembunyikan nama (Hamba Allah)
          </label>
        </div>
        <div>
          <label className="label" htmlFor="contact">Email atau WhatsApp <span className="font-normal text-muted">(opsional)</span></label>
          <input id="contact" name="contact" className="input" placeholder="Untuk mengingatkan kode tiketmu" maxLength={100} />
          <p className="mt-2 text-xs text-muted">Tidak pernah ditampilkan ke publik.</p>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="message">Doa atau pesan dukungan <span className="font-normal text-muted">(opsional)</span></label>
        <textarea id="message" name="message" className="input min-h-28" maxLength={280} placeholder="Tulis doa atau semangat untuk para penyintas" />
      </div>

      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <Submit className="btn w-full py-4 text-lg">Donate {value >= 10_000 ? rp(value) : ""}</Submit>
    </form>
  );
}
