import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectFlow } from "@/components/ProjectFlow";
import { Progress } from "@/components/ui";
import { one } from "@/lib/db";
import { pct, rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = await one("campaigns", "slug", (await params).slug);
  return { title: c ? `${c.title} | dibersamai.id` : "Project | dibersamai.id", description: c?.summary };
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { campaigns, donations, disbursements, expenses, summary } = await loadAll();
  const c = campaigns.find((x) => x.slug === slug && (x.status === "aktif" || x.status === "selesai"));
  if (!c) notFound();
  const s = summary.per.get(c.id)!;
  const prayers = donations
    .filter((d) => d.campaign_id === c.id && d.status === "terverifikasi" && d.message)
    .sort((a, b) => (b.verified_at ?? "").localeCompare(a.verified_at ?? ""));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="max-w-4xl text-3xl font-extrabold md:text-5xl">{c.title}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
            <Image src={c.image} alt={c.title} fill sizes="(max-width:1024px) 100vw, 66vw" className="object-cover" priority />
          </div>
          <p className="mt-6 border-b border-line pb-6 text-sm">
            <b>{c.organizer}</b> menggalang dana untuk penyintas di <b>{c.location}</b>
          </p>
          <p className="mt-6 text-lg leading-relaxed">{c.summary}</p>
          <p className="mt-4 leading-relaxed text-muted">{c.story}</p>
          {c.programs.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl font-extrabold">Program yang didanai</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {c.programs.map((p) => (
                  <li key={p} className="rounded-2xl bg-mist p-4 font-semibold">{p}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-line p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:sticky lg:top-24">
          <p className="text-2xl font-extrabold">{rp(s.masuk)}</p>
          <p className="text-sm text-muted">terkumpul dari target {rp(c.target)}</p>
          <div className="mt-3"><Progress value={s.masuk} max={c.target} /></div>
          <p className="mt-2 text-sm text-muted">{pct(s.masuk, c.target)}% · {s.donors} donatur</p>
          <Link href={`/donasi?campaign=${c.slug}`} className="btn mt-6 w-full py-4 text-lg">Donate</Link>
          <Link href="/tiket" className="btn-ghost mt-3 w-full">Cek tiket donasi</Link>
          <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Tersalurkan</dt><dd className="font-bold">{rp(s.tersalurkan)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Promosi</dt><dd className="font-bold">{rp(s.promosi)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Operasional</dt><dd className="font-bold">{rp(s.operasional)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Tersimpan</dt><dd className="font-bold">{rp(s.tersimpan)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted">Maksimal {c.ops_percent}% dari donasi dipakai untuk promosi dan operasional.</p>
          <a href="#pencairan" className="mt-3 block text-sm font-bold text-brand-2 underline underline-offset-4">Lihat detail pencairan</a>
        </aside>
      </div>

      <section id="pencairan" className="scroll-mt-24 pt-16">
        <h2 className="text-3xl font-extrabold">Ke mana dana project ini pergi</h2>
        <div className="mt-6">
          <ProjectFlow campaign={c} flow={s} donations={donations} disbursements={disbursements} expenses={expenses} />
        </div>
      </section>

      {prayers.length > 0 && (
        <section className="pt-16">
          <h2 className="text-2xl font-extrabold">Doa dan dukungan ({prayers.length})</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {prayers.slice(0, 10).map((p) => (
              <li key={p.id} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-2 font-bold text-brand">{p.name[0]}</span>
                <div>
                  <p className="text-sm"><b>{p.name}</b> <span className="text-muted">· {rp(p.total)} · {tgl(p.verified_at)}</span></p>
                  <p className="mt-0.5">{p.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
