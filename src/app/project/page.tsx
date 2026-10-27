import { CampaignCard } from "@/components/ui";
import { loadAll } from "@/lib/logic";

export const metadata = { title: "Project | dibersamai.id" };

export default async function ProjectPage() {
  const { campaigns, summary } = await loadAll();
  const shown = campaigns.filter((c) => c.status === "aktif" || c.status === "selesai");
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="chip">Running project</p>
      <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Project pemulihan yang sedang berjalan</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Setiap project menggabungkan pendampingan psikologis dan bantuan kebutuhan dasar. Pilih yang ingin kamu dukung.</p>
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <CampaignCard key={c.id} c={c} s={summary.per.get(c.id)} />
        ))}
      </div>
    </div>
  );
}
