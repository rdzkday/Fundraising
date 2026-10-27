import Image from "next/image";
import Link from "next/link";
import { CampaignCard, Section, Stat } from "@/components/ui";
import { rp } from "@/lib/format";
import { loadAll } from "@/lib/logic";

const HERO = [
  ["/img/demonstrasi.jpg", "Kerumunan demonstrasi di jalan kota"],
  ["/img/wildfire.jpg", "Kebakaran hutan di lereng bukit"],
  ["/img/gempa.jpg", "Reruntuhan bangunan setelah gempa"],
  ["/img/longsor.jpg", "Longsor menutup sebagian jalan"],
  ["/img/banjir.jpg", "Warga mendorong mobil menembus banjir"],
  ["/img/erupsi.jpg", "Gunung meletus di malam hari"],
];

const STEPS = [
  ["Donasi & dapat tiket", "Pilih campaign dan nominal. Sistem menambahkan kode unik 3 digit dan memberi kode tiket pribadi."],
  ["Terverifikasi", "Transfer dicocokkan otomatis dengan mutasi rekening lewat kode unik. Bisa dipercepat dengan unggah bukti transfer."],
  ["Tersalurkan", "Donasi disalurkan urut masuk. Tiket menunjukkan berapa rupiah donasimu ikut di penyaluran yang mana."],
  ["Ada buktinya", "Setiap penyaluran disertai bukti: kuitansi, foto kegiatan, atau laporan konselor."],
];

export default async function Home() {
  const { campaigns, summary } = await loadAll();
  const active = campaigns.filter((c) => c.status === "aktif");
  return (
    <>
      <section className="overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 pt-14 text-center md:pt-20">
          <p className="chip">Gerakan transparansi donasi</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] md:text-7xl">
            Pulih bersama.
            <br />
            Lacak setiap rupiahnya.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Bencana dan krisis meninggalkan luka yang tidak terlihat. dibersamai.id menggalang dana untuk pemulihan fisik dan mental
            korban, dan setiap donatur mendapat tiket untuk melihat ke mana uangnya pergi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/donasi" className="btn text-lg">Donate sekarang</Link>
            <Link href="/dashboard" className="btn-ghost text-lg">Lihat aliran dana</Link>
          </div>
        </div>
        <div className="mx-auto mt-14 flex max-w-7xl items-end justify-center gap-3 px-4">
          {HERO.map(([src, alt], i) => (
            <div
              key={src}
              className="relative shrink-0 overflow-hidden rounded-3xl"
              style={{ width: "min(30vw, 200px)", height: [260, 220, 300, 300, 220, 260][i] }}
            >
              <Image src={src} alt={alt} fill sizes="200px" className="object-cover" priority={i < 3} />
            </div>
          ))}
        </div>
      </section>

      <Section title="Campaign yang sedang berjalan" kicker="Butuh dukunganmu">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {active.map((c) => (
            <CampaignCard key={c.id} c={c} s={summary.per.get(c.id)} />
          ))}
        </div>
      </Section>

      <Section title="Bukan cuma makanan dan tenda" kicker="Pemulihan menyeluruh">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src="/img/pendampingan.jpg" alt="Empat orang saling merangkul menatap matahari terbenam" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="space-y-6">
            <p className="text-lg text-muted">
              Rumah bisa dibangun ulang. Rasa aman butuh waktu lebih lama. Donasimu membiayai pendampingan psikologis yang sering terlupakan
              setelah bantuan darurat selesai.
            </p>
            {[
              ["Trauma healing", "Sesi berbasis permainan dan seni untuk anak-anak di posko dan sekolah."],
              ["Konseling", "Sesi individu dan kelompok bersama psikolog, gratis bagi penyintas."],
              ["Kebutuhan dasar", "Pangan, kebersihan, dan kesehatan selama masa transisi."],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-4">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-lime ring-4 ring-lime-2" />
                <div>
                  <p className="font-bold">{t}</p>
                  <p className="text-muted">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Setiap donasi punya tiket. Setiap tiket punya jejak." kicker="Kenapa dibersamai.id">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <ol className="grid gap-4 sm:grid-cols-2">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-extrabold text-lime">{i + 1}</span>
                <p className="mt-4 text-lg font-bold">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
          <div className="rounded-3xl bg-brand p-6 text-white md:p-8">
            <p className="text-sm font-semibold text-lime">Contoh tiket</p>
            <p className="mt-1 font-mono text-2xl font-bold">DB-DEMO01</p>
            <ul className="mt-6 space-y-4 text-sm">
              {["Donasi Rp500.101 diterima", "Terverifikasi otomatis dari mutasi", "Ikut dalam honor psikolog 12 sesi konseling", "Bukti penyaluran tersedia"].map((x) => (
                <li key={x} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-xs font-bold text-brand">✓</span>
                  {x}
                </li>
              ))}
            </ul>
            <Link href="/tiket/DB-DEMO01" className="mt-8 inline-flex rounded-full bg-lime px-5 py-2.5 font-bold text-brand">
              Buka tiket contoh
            </Link>
          </div>
        </div>
      </Section>

      <Section title="Uangnya ada di mana sekarang?" kicker="Terbuka untuk semua">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Donasi masuk" value={rp(summary.masuk)} note={`${summary.donors} donasi terverifikasi`} dark />
          <Stat label="Tersimpan" value={rp(summary.tersimpan)} note="Siap disalurkan" />
          <Stat label="Tersalurkan" value={rp(summary.tersalurkan)} note="Lengkap dengan bukti" />
          <Stat label="Promosi & operasional" value={rp(summary.opsUsed)} note={`Terpakai dari anggaran ${rp(summary.opsBudget)}`} />
        </div>
        <Link href="/dashboard" className="mt-6 inline-block font-bold text-brand-2 underline underline-offset-4">
          Lihat dashboard lengkap
        </Link>
      </Section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <figure className="relative overflow-hidden rounded-[2rem] bg-lime px-6 py-14 md:px-16 md:py-20">
          <svg viewBox="0 0 40 32" className="h-10 w-12 fill-brand" aria-hidden><path d="M0 32V18C0 8 6 2 16 0l2 4c-6 2-9 6-9 12h7v16H0zm22 0V18c0-10 6-16 16-18l2 4c-6 2-9 6-9 12h7v16H22z" /></svg>
          <blockquote className="mt-6 max-w-4xl text-3xl font-extrabold leading-tight text-brand md:text-5xl">
            dibersamai.id bukan crowdfunding biasa. Kami adalah gerakan transparansi yang dimulai dari diri sendiri: akuntabilitas pengelolaan
            keuangan yang setransparan itu.
          </blockquote>
          <figcaption className="mt-6 font-semibold text-brand/80">Tim dibersamai.id</figcaption>
        </figure>
      </section>

      <Section title="Lembaga atau komunitasmu sedang mendampingi penyintas?" kicker="Galang dana">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-mist p-8">
          <p className="max-w-xl text-muted">Ajukan campaign. Setelah diverifikasi, campaignmu tampil dengan standar transparansi yang sama: tiket donatur, mutasi tersensor, dan bukti penyaluran.</p>
          <Link href="/pendanaan#galang" className="btn">Ajukan campaign</Link>
        </div>
      </Section>
    </>
  );
}
