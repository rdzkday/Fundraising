// Data contoh untuk mode demo. Semua nama, nominal, dan transaksi fiktif.
import type { Campaign, Disbursement, Donation, Expense, Inquiry, Mutation, Setting, Upload } from "./types";

const DAY = 86_400_000;
const ago = (days: number, hour = 10) => {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const day = (days: number) => ago(days).slice(0, 10);

export const DEFAULT_WHITELIST =
  "TRANSFER TRF DARI KE DAN DI DONASI BIAYA ADM ADMIN BUNGA PAJAK SETORAN TUNAI BI FAST BIFAST QRIS VA VIRTUAL ACCOUNT PEMINDAHBUKUAN KARTU DEBIT PEMBAYARAN PENYALURAN PLATFORM FEE SETTLEMENT ONLINE ATM BANK PROGRAM BULANAN POTONGAN SALDO KONSELOR IKLAN OPERASIONAL";

const campaigns: Campaign[] = [
  {
    id: "c-karhutla",
    slug: "pulihkan-napas-karhutla",
    title: "Pulihkan napas dan jiwa warga terdampak karhutla",
    category: "Kebakaran hutan",
    location: "Kalimantan Tengah",
    summary: "Asap berbulan-bulan meninggalkan sesak di dada dan cemas di kepala. Kita dampingi pemulihannya.",
    story:
      "Kabut asap kebakaran hutan dan lahan membuat sekolah tutup, warga kehilangan kebun, dan anak-anak tumbuh dengan rasa takut setiap musim kemarau datang. Selain masker dan pemeriksaan kesehatan, kami menghadirkan konselor untuk sesi pemulihan bagi keluarga yang kehilangan mata pencaharian, serta ruang bermain aman bagi anak.",
    programs: ["Konseling keluarga petani", "Ruang aman & trauma healing anak", "Masker N95 dan cek kesehatan paru"],
    image: "/img/karhutla.jpg",
    image_credit: "Joanne Francis / Unsplash",
    target: 250_000_000,
    ops_percent: 5,
    status: "aktif",
    organizer: "Tim dibersamai.id",
    contact: "",
    created_at: ago(40),
  },
  {
    id: "c-banjir",
    slug: "trauma-healing-banjir-longsor",
    title: "Trauma healing anak korban banjir dan longsor",
    category: "Banjir & longsor",
    location: "Sumatera Barat",
    summary: "Rumah bisa dibangun ulang dalam hitungan bulan. Rasa aman anak-anak butuh pendampingan lebih lama.",
    story:
      "Banjir bandang dan longsor datang tanpa peringatan. Banyak anak masih terbangun setiap kali hujan deras turun. Bersama psikolog dan relawan lokal, kami menjalankan sesi trauma healing berbasis permainan di posko pengungsian, membekali guru untuk mengenali tanda trauma, dan menyalurkan paket kebutuhan dasar bagi keluarga.",
    programs: ["Trauma healing berbasis permainan", "Pelatihan guru pendamping", "Paket pangan dan kebersihan"],
    image: "/img/banjir.jpg",
    image_credit: "Saikiran Kesari / Unsplash",
    target: 180_000_000,
    ops_percent: 5,
    status: "aktif",
    organizer: "Tim dibersamai.id",
    contact: "",
    created_at: ago(30),
  },
  {
    id: "c-gempa",
    slug: "pendampingan-penyintas-gempa",
    title: "Pendampingan psikologis penyintas gempa",
    category: "Gempa bumi",
    location: "Jawa Barat",
    summary: "Getaran sudah berhenti, tapi ketakutannya belum. Bantu penyintas pulih lewat konseling dan dukungan kelompok.",
    story:
      "Setelah gempa, banyak penyintas tidak berani tidur di dalam rumah meski bangunannya sudah dinyatakan aman. Kami membuka sesi konseling individu, kelompok dukungan sebaya untuk para ibu dan lansia, serta menyalurkan kebutuhan dasar selama masa transisi.",
    programs: ["Konseling individu oleh psikolog", "Kelompok dukungan sebaya", "Kebutuhan dasar masa transisi"],
    image: "/img/gempa.jpg",
    image_credit: "Sebastian Schuster / Unsplash",
    target: 200_000_000,
    ops_percent: 5,
    status: "aktif",
    organizer: "Tim dibersamai.id",
    contact: "",
    created_at: ago(25),
  },
  {
    id: "c-demonstrasi",
    slug: "pemulihan-mental-pasca-kericuhan",
    title: "Pemulihan mental warga terdampak kericuhan demonstrasi",
    category: "Krisis sosial",
    location: "DKI Jakarta",
    summary: "Siapa pun yang terdampak berhak pulih. Kami sediakan konseling gratis tanpa melihat latar belakang.",
    story:
      "Kericuhan di sekitar aksi demonstrasi meninggalkan luka bagi warga sekitar, pedagang, pelajar, dan relawan medis. Program ini netral dan tidak berpihak: kami menyediakan sesi konseling gratis, layanan pendampingan lewat telepon, dan rujukan ke psikolog bagi siapa pun yang membutuhkan.",
    programs: ["Konseling gratis tatap muka", "Layanan dukungan lewat telepon", "Rujukan psikolog & psikiater"],
    image: "/img/demonstrasi.jpg",
    image_credit: "Bagir Bahana / Unsplash",
    target: 120_000_000,
    ops_percent: 5,
    status: "aktif",
    organizer: "Tim dibersamai.id",
    contact: "",
    created_at: ago(15),
  },
];

const people: [string, string][] = [
  ["Hamba Allah", "Semoga lekas pulih, saudara-saudaraku."],
  ["Rina", "Untuk adik-adik di posko, semoga bisa tertawa lagi."],
  ["Andi P.", ""],
  ["Hamba Allah", "Bismillah, semoga berkah."],
  ["Keluarga Wijaya", "Kuat terus, kalian tidak sendiri."],
  ["Dewi", "Semoga para konselor diberi kekuatan."],
  ["Hamba Allah", ""],
  ["Bagus", "Sedikit dari kami, semoga bermanfaat."],
  ["Sari & Tim", "Doa terbaik untuk semua penyintas."],
  ["Hamba Allah", "Semoga Allah mudahkan pemulihannya."],
  ["Yusuf", ""],
  ["Maya", "Pulih bersama, tumbuh bersama."],
];

export function seed() {
  const donations: Donation[] = [];
  const mutations: Mutation[] = [];
  const plan: [string, number, number][] = [
    ["c-gempa", 500_000, 20], ["c-karhutla", 1_000_000, 19], ["c-banjir", 250_000, 18],
    ["c-gempa", 2_000_000, 16], ["c-karhutla", 300_000, 14], ["c-banjir", 750_000, 13],
    ["c-demonstrasi", 150_000, 12], ["c-gempa", 100_000, 10], ["c-banjir", 5_000_000, 9],
    ["c-karhutla", 200_000, 7], ["c-demonstrasi", 1_500_000, 5], ["c-gempa", 350_000, 3],
  ];
  plan.forEach(([campaign_id, base, d], i) => {
    const code = ((i * 137) % 900) + 101;
    const [name, message] = people[i];
    const id = `d-${i + 1}`;
    donations.push({
      id, ticket: i === 0 ? "DB-DEMO01" : `DB-SEED${String(i + 1).padStart(2, "0")}`, campaign_id, name, contact: "",
      message, base_amount: base, unique_code: code, total: base + code, status: "terverifikasi", proof_path: null,
      verified_at: ago(d, 15), verified_via: "mutasi", mutation_id: `m-${i + 1}`, priority: 0,
      created_at: ago(d, 9), expires_at: ago(d - 1, 9),
    });
    mutations.push({
      id: `m-${i + 1}`, upload_id: "u-1", date: day(d), public_desc: `TRANSFER DARI ███ ${i % 2 ? "BI FAST" : "DONASI"}`,
      credit: base + code, debit: 0, balance: 0, category: "donasi", dedupe_key: `seed-${i}`, donation_id: id,
    });
  });
  // Satu donasi yang masih menunggu transfer, untuk contoh alur tiket.
  donations.push({
    id: "d-pending", ticket: "DB-DEMO02", campaign_id: "c-banjir", name: "Hamba Allah", contact: "",
    message: "Semoga cepat pulih.", base_amount: 200_000, unique_code: 482, total: 200_482,
    status: "menunggu_transfer", proof_path: null, verified_at: null, verified_via: null, mutation_id: null,
    priority: 0, created_at: ago(0, 8), expires_at: new Date(Date.now() + 20 * 3_600_000).toISOString(),
  });

  const disbursements: Disbursement[] = [
    { id: "s-1", campaign_id: "c-gempa", date: day(8), purpose: "Honor psikolog untuk 12 sesi konseling individu", amount: 1_800_000, evidence_path: "/img/bukti-contoh.svg", created_at: ago(8) },
    { id: "s-2", campaign_id: "c-karhutla", date: day(6), purpose: "Masker N95 untuk 300 warga Desa Tumbang", amount: 900_000, evidence_path: "/img/bukti-contoh.svg", created_at: ago(6) },
    { id: "s-3", campaign_id: "c-banjir", date: day(4), purpose: "Perlengkapan trauma healing di 2 posko pengungsian", amount: 3_500_000, evidence_path: "/img/bukti-contoh.svg", created_at: ago(4) },
    { id: "s-4", campaign_id: "c-demonstrasi", date: day(2), purpose: "Sewa ruang dan konselor untuk sesi kelompok", amount: 700_000, evidence_path: null, created_at: ago(2) },
  ];
  const expenses: Expense[] = [
    { id: "e-1", campaign_id: "c-banjir", date: day(15), kind: "promosi", description: "Iklan media sosial campaign banjir", amount: 150_000, created_at: ago(15) },
    { id: "e-2", campaign_id: "c-gempa", date: day(12), kind: "promosi", description: "Desain poster dan iklan campaign gempa", amount: 100_000, created_at: ago(12) },
    { id: "e-3", campaign_id: "c-karhutla", date: day(11), kind: "operasional", description: "Transport relawan survei lokasi", amount: 60_000, created_at: ago(11) },
    { id: "e-4", campaign_id: null, date: day(10), kind: "operasional", description: "Server dan domain dibersamai.id (umum)", amount: 150_000, created_at: ago(10) },
  ];

  let bal = 2_000_000;
  const out: [number, string, number, string][] = [
    [8, "TRANSFER KE ███ PENYALURAN", 1_800_000, "penyaluran"],
    [6, "TRANSFER KE ███ PENYALURAN", 900_000, "penyaluran"],
    [4, "TRANSFER KE ███ PENYALURAN", 3_500_000, "penyaluran"],
    [2, "TRANSFER KE ███", 700_000, "penyaluran"],
    [15, "PEMBAYARAN ███ IKLAN", 150_000, "operasional"],
    [12, "PEMBAYARAN ███ IKLAN", 100_000, "operasional"],
    [11, "TRANSFER KE ███", 60_000, "operasional"],
    [10, "PEMBAYARAN ███", 150_000, "operasional"],
    [1, "BIAYA ADM BULANAN", 15_000, "biaya_bank"],
  ];
  out.forEach(([d, desc, amt, cat], i) =>
    mutations.push({ id: `m-out-${i}`, upload_id: "u-1", date: day(d), public_desc: desc, credit: 0, debit: amt, balance: 0, category: cat as Mutation["category"], dedupe_key: `seed-out-${i}`, donation_id: null }),
  );
  mutations.sort((a, b) => a.date.localeCompare(b.date));
  for (const m of mutations) m.balance = bal = bal + m.credit - m.debit;

  const uploads: Upload[] = [{ id: "u-1", source: "****6789", uploaded_at: ago(0, 7), count: mutations.length }];
  const settings: Setting[] = [
    { id: "bank_name", value: "Bank Contoh (demo)" },
    { id: "bank_account", value: "1234567890" },
    { id: "bank_holder", value: "Yayasan Dibersamai Indonesia" },
    { id: "qris_image", value: "/img/qris-demo.svg" },
    { id: "default_ops_percent", value: "5" },
    { id: "whitelist", value: DEFAULT_WHITELIST },
  ];
  return { campaigns, donations, disbursements, expenses, mutations, uploads, settings, inquiries: [] as Inquiry[] };
}
