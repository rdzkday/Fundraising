"use client";

import { useActionState } from "react";
import { proposeCampaign } from "@/app/actions";
import { Submit } from "@/components/client";
import { Notice } from "@/components/ui";

export function ProposeForm() {
  const [state, action] = useActionState(proposeCampaign, null);
  if (state?.ok) return <Notice kind="ok">{state.ok}</Notice>;
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="p-title">Judul campaign</label>
        <input id="p-title" name="title" className="input" required maxLength={120} placeholder="mis. Konseling penyintas banjir Demak" />
      </div>
      <div>
        <label className="label" htmlFor="p-org">Nama lembaga / komunitas</label>
        <input id="p-org" name="organizer" className="input" required maxLength={100} />
      </div>
      <div>
        <label className="label" htmlFor="p-contact">Email atau WhatsApp penanggung jawab</label>
        <input id="p-contact" name="contact" className="input" required maxLength={100} />
      </div>
      <div>
        <label className="label" htmlFor="p-cat">Jenis bencana / krisis</label>
        <input id="p-cat" name="category" className="input" maxLength={40} placeholder="Banjir, gempa, konflik sosial..." />
      </div>
      <div>
        <label className="label" htmlFor="p-loc">Lokasi</label>
        <input id="p-loc" name="location" className="input" maxLength={80} />
      </div>
      <div>
        <label className="label" htmlFor="p-target">Target dana (Rp)</label>
        <input id="p-target" name="target" className="input" inputMode="numeric" placeholder="100000000" />
      </div>
      <div>
        <label className="label" htmlFor="p-sum">Ringkasan satu kalimat</label>
        <input id="p-sum" name="summary" className="input" maxLength={200} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="p-story">Cerita dan rencana penggunaan dana</label>
        <textarea id="p-story" name="story" className="input min-h-32" maxLength={4000} placeholder="Siapa yang didampingi, program apa (trauma healing, konseling, kebutuhan dasar), dan bagaimana bukti penyaluran akan dikirim." />
      </div>
      {state?.error && <div className="sm:col-span-2"><Notice kind="error">{state.error}</Notice></div>}
      <div className="sm:col-span-2"><Submit>Kirim pengajuan</Submit></div>
    </form>
  );
}
