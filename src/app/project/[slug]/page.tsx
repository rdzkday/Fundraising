import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Progress } from "@/components/ui";
import { BUCKET_PUBLIC, fileUrl, one } from "@/lib/db";
import { pct, rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const c = await one("campaigns", "slug", (await params).slug);
  return { title: c ? `${c.title} | dibersamai.id` : "Project | dibersamai.id", description: c?.summary };
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { campaigns, donations, disbursements, summary } = await loadAll();
  const c = campaigns.find((x) => x.slug === slug && (x.status === "aktif" || x.status === "selesai"));
  if (!c) notFound();
  const s = summary.per.get(c.id)!;
  const outs = disbursements.filter((x) => x.campaign_id === c.id).sort((a, b) => b.date.localeCompare(a.date));
  const evidence = await Promise.all(outs.map((o) => fileUrl(BUCKET_PUBLIC, o.evidence_path)));
  const prayers = donations
    .filter((d) => d.campaign_id === c.id && d.status === "terverifikasi")
    .sort((a, b) => (b.verified_at ?? "").localeCompare(a.verified_at ?? ""));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="max-w-4xl text-3xl font-extrabold md:text-5xl">{c.title}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
            <Image src={c.image} alt={c.title} fill sizes="(max-width:1024px) 100vw, 66vw" className="object-cover" priority />
          </div>
          <p className="mt-2 text-xs text-muted">Foto ilustrasi: {c.image_credit}</p>
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

          <h2 className="mt-12 text-2xl font-extrabold">Penyaluran ({outs.length})</h2>
          {outs.length === 0 ? (
            <p className="mt-3 text-muted">Belum ada penyaluran. Dana tersimpan dan tercatat di dashboard.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
              {outs.map((o, i) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{o.purpose}</p>
                    <p className="text-xs text-muted">{tgl(o.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{rp(o.amount)}</p>
                    {evidence[i] ? (
                      <a href={evidence[i]!} target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-2 underline">Lihat bukti</a>
                    ) : (
                      <span className="text-xs text-warn">Bukti menyusul</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-12 text-2xl font-extrabold">Doa dan dukungan ({prayers.filter((p) => p.message).length})</h2>
          <ul className="mt-4 space-y-4">
            {prayers.filter((p) => p.message).slice(0, 10).map((p) => (
              <li key={p.id} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-2 font-bold text-brand">{p.name[0]}</span>
                <div>
                  <p className="text-sm"><b>{p.name}</b> <span className="text-muted">· {rp(p.total)} · {tgl(p.verified_at)}</span></p>
                  <p className="mt-0.5">{p.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-3xl border border-line p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:sticky lg:top-24">
          <p className="text-2xl font-extrabold">{rp(s.raised)}</p>
          <p className="text-sm text-muted">terkumpul dari target {rp(c.target)}</p>
          <div className="mt-3"><Progress value={s.raised} max={c.target} /></div>
          <p className="mt-2 text-sm text-muted">{pct(s.raised, c.target)}% · {s.donors} donatur</p>
          <Link href={`/donasi?campaign=${c.slug}`} className="btn mt-6 w-full py-4 text-lg">Donate</Link>
          <Link href="/tiket" className="btn-ghost mt-3 w-full">Cek tiket donasi</Link>
          <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Sudah tersalurkan</dt><dd className="font-bold">{rp(s.disbursed)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Promosi & operasional ({c.ops_percent}%)</dt><dd className="font-bold">{rp(s.ops)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Tersimpan untuk program</dt><dd className="font-bold">{rp(s.raised - s.ops - s.disbursed)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
