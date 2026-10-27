import { all } from "@/lib/db";
import { DonateForm } from "./DonateForm";

export const metadata = { title: "Donate | dibersamai.id" };

export default async function DonasiPage({ searchParams }: { searchParams: Promise<{ campaign?: string }> }) {
  const { campaign } = await searchParams;
  const campaigns = (await all("campaigns")).filter((c) => c.status === "aktif");
  const initial = campaigns.find((c) => c.slug === campaign)?.id;
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-4xl font-extrabold md:text-5xl">Donasi untuk pemulihan</h1>
        <p className="mt-3 text-lg text-muted">Isi form di bawah. Kamu langsung mendapat tiket untuk melacak donasimu sampai tersalurkan.</p>
        <div className="mt-10">
          <DonateForm campaigns={campaigns.map((c) => ({ id: c.id, title: c.title, ops: c.ops_percent }))} initial={initial} />
        </div>
      </div>
      <aside className="h-fit space-y-4 rounded-3xl bg-mist p-6 lg:sticky lg:top-24">
        <p className="font-bold">Yang terjadi setelah klik Donate</p>
        {[
          "Kamu mendapat kode tiket dan nominal transfer dengan kode unik.",
          "Transfer ke rekening atau QRIS dibersamai.id dalam 24 jam.",
          "Sistem mencocokkan transferanmu dari mutasi rekening. Bisa dipercepat dengan unggah bukti transfer.",
          "Pantau di tiket: kapan disalurkan, ke mana, dan apa buktinya.",
        ].map((t, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-lime">{i + 1}</span>
            <p className="text-muted">{t}</p>
          </div>
        ))}
      </aside>
    </div>
  );
}
