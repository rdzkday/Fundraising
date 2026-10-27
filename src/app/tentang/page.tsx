import Image from "next/image";
import Link from "next/link";
import { submitAudit } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import { Submit } from "@/components/client";
import { rp, tgl } from "@/lib/format";
import { loadAll } from "@/lib/logic";

export const metadata = {
  title: "Tentang Kami | dibersamai.id",
  description: "Visi dibersamai.id: crowdfunding yang setiap rupiahnya bisa dilihat sudah berubah jadi apa.",
};

const YEAR = new Date().getFullYear();

const PRINCIPLES = [
  ["Dilacak per donasi", "Bukan cuma laporan total. Setiap donatur memegang tiket yang menunjukkan nasib donasinya sendiri."],
  ["Biaya kami dibuka", "Promosi dan operasional dicatat terpisah, dengan batas persen yang diumumkan sebelum kamu berdonasi."],
  ["Bukti, bukan janji", "Setiap pencairan disertai kuitansi, foto kegiatan, atau laporan pendamping."],
  ["Identitas tetap aman", "Transparansi tidak berarti membuka data pribadi. Nama dan nomor rekening disensor sebelum tampil."],
];

export default async function Tentang() {
  const { disbursements, summary } = await loadAll();
  const recent = [...disbursements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const t = summary.total;

  return (
    <>
      <section className="mx-auto max-w-4xl px-4 pt-16 text-center md:pt-20">
        <p className="chip">Tentang Kami</p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] md:text-6xl">Donasimu sekarang sudah berubah jadi apa?</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Pertanyaan sederhana itu jarang bisa dijawab oleh lembaga penggalang dana. dibersamai.id lahir untuk menjawabnya, untuk setiap rupiah,
          kepada setiap donatur.
        </p>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src="/img/tangan.jpg" alt="Tangan-tangan bertumpuk tanda kebersamaan" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="space-y-4 text-lg">
          <h2 className="text-3xl font-extrabold">Visi kami</h2>
          <p>
            Kami ingin lembaga fundraising dan crowdfunding di Indonesia jauh lebih transparan dari hari ini. Donatur tidak cukup menerima laporan
            total di akhir program. Mereka berhak melihat langsung uangnya sudah menjadi apa: sesi konseling, masker, paket pangan, atau honor
            pendamping.
          </p>
          <p className="text-muted">
            Dan kalau belum tersalurkan, donatur juga berhak tahu: uangnya tersimpan di mana, berapa jumlahnya, dan sedang menunggu apa.
            Lembaga yang jujur seharusnya bisa membuktikan dirinya dengan mudah. Kami memulainya dari diri sendiri.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <h2 className="text-3xl font-extrabold">Saat ini, uang donatur kami</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-brand p-6 text-white md:p-8">
            <p className="text-sm font-semibold text-lime">Sudah berubah menjadi</p>
            <p className="mt-1 text-3xl font-extrabold">{rp(t.tersalurkan)}</p>
            <ul className="mt-5 space-y-3 text-sm">
              {recent.map((d) => (
                <li key={d.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime" />
                  <span>{d.purpose} <span className="text-white/60">· {rp(d.amount)} · {tgl(d.date)}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-mist p-6 md:p-8">
            <p className="text-sm font-semibold text-muted">Belum tersalurkan, tersimpan di rekening</p>
            <p className="mt-1 text-3xl font-extrabold">{rp(t.tersimpan)}</p>
            <p className="mt-5 text-sm text-muted">
              Menunggu jadwal program berikutnya di lapangan. Setiap donatur bisa melihat posisi donasinya di antrean penyaluran lewat tiket.
            </p>
            <p className="mt-4 text-sm text-muted">
              Promosi {rp(t.promosi)} dan operasional {rp(t.operasional)} dicatat terpisah di{" "}
              <Link href="/dashboard" className="font-bold text-brand-2 underline underline-offset-4">dashboard</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <h2 className="text-3xl font-extrabold">Prinsip kami</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(([title, body]) => (
            <li key={title} className="card p-6">
              <p className="text-lg font-bold">{title}</p>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="laporan" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20">
        <h2 className="text-3xl font-extrabold">Laporan keuangan</h2>
        <div className="mt-6 rounded-3xl border-2 border-dashed border-line p-8 text-center md:p-12">
          <p className="text-lg font-bold">Belum ada laporan keuangan teraudit</p>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            dibersamai.id masih di tahun pertama. Laporan keuangan tahunan {YEAR} akan dipublikasikan di sini setelah diperiksa auditor eksternal.
            Sementara itu, seluruh arus kas bisa dilihat langsung di halaman{" "}
            <Link href="/pendanaan" className="font-bold text-brand-2 underline underline-offset-4">Pendanaan</Link>.
          </p>
        </div>
      </section>

      <section id="audit" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20">
        <div className="grid gap-10 rounded-3xl bg-lime p-6 md:grid-cols-2 md:p-12">
          <div className="text-brand">
            <p className="text-sm font-bold uppercase tracking-wide">Kolaborasi audit eksternal</p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Kami ingin diaudit. Silakan ajukan.</h2>
            <p className="mt-4">
              Transparansi yang kami bangun perlu diuji pihak independen. Kami mencari kantor akuntan publik atau auditor yang bersedia
              berkolaborasi memeriksa laporan keuangan dibersamai.id untuk tahun {YEAR}.
            </p>
            <p className="mt-4">Kami akan membuka seluruh data yang dibutuhkan, termasuk mutasi rekening asli, langsung kepada auditor.</p>
          </div>
          <ActionForm action={submitAudit} className="space-y-3 rounded-2xl bg-white p-6">
            <div>
              <label className="label" htmlFor="a-name">Nama</label>
              <input id="a-name" name="name" className="input" required maxLength={100} />
            </div>
            <div>
              <label className="label" htmlFor="a-org">Kantor akuntan / lembaga</label>
              <input id="a-org" name="organization" className="input" required maxLength={120} />
            </div>
            <div>
              <label className="label" htmlFor="a-contact">Email atau WhatsApp</label>
              <input id="a-contact" name="contact" className="input" required maxLength={100} />
            </div>
            <div>
              <label className="label" htmlFor="a-msg">Pesan <span className="font-normal text-muted">(opsional)</span></label>
              <textarea id="a-msg" name="message" className="input min-h-24" maxLength={2000} placeholder="Ruang lingkup, pengalaman audit lembaga nirlaba, atau pertanyaan" />
            </div>
            <Submit className="btn w-full">Ajukan kolaborasi</Submit>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
