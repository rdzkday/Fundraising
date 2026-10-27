import Image from "next/image";
import Link from "next/link";
import { rp, pct } from "@/lib/format";
import type { CampaignStats } from "@/lib/logic";
import type { Campaign } from "@/lib/types";

export function Progress({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={pct(value, max)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand-2" style={{ width: `${pct(value, max)}%` }} />
    </div>
  );
}

export function CampaignCard({ c, s }: { c: Campaign; s?: CampaignStats }) {
  const raised = s?.raised ?? 0;
  return (
    <Link href={`/project/${c.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <Image src={c.image} alt={c.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold">{c.location}</span>
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-2">{c.category}</p>
        <h3 className="mt-1 text-lg font-bold leading-snug group-hover:underline">{c.title}</h3>
        <div className="mt-auto pt-3">
          <Progress value={raised} max={c.target} />
          <p className="mt-2 text-sm">
            <b>{rp(raised)}</b> <span className="text-muted">terkumpul dari {rp(c.target)}</span>
          </p>
          <p className="text-xs text-muted">{s?.donors ?? 0} donatur · {rp(s?.disbursed ?? 0)} sudah tersalurkan</p>
        </div>
      </div>
    </Link>
  );
}

export function Stat({ label, value, note, dark }: { label: string; value: string; note?: string; dark?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${dark ? "bg-brand text-white" : "bg-mist"}`}>
      <p className={`text-sm font-semibold ${dark ? "text-lime" : "text-muted"}`}>{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">{value}</p>
      {note && <p className={`mt-1 text-xs ${dark ? "text-white/70" : "text-muted"}`}>{note}</p>}
    </div>
  );
}

export function Section({ title, kicker, children, id }: { title: string; kicker?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 pt-20">
      {kicker && <p className="chip mb-3">{kicker}</p>}
      <h2 className="text-3xl font-extrabold md:text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function Notice({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  return (
    <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${kind === "ok" ? "bg-lime-2 text-brand" : "bg-red-50 text-red-700"}`}>{children}</p>
  );
}
