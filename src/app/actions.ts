"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { login, logout, requireAdmin } from "@/lib/auth";
import { all, BUCKET_PRIVATE, BUCKET_PUBLIC, insert, one, update, uploadFile, upsert } from "@/lib/db";
import { EXPIRY_HOURS, newTicket, pickUniqueCode, viewStatus } from "@/lib/logic";
import type { Campaign, Evidence, Expense, Mutation, MutationCategory } from "@/lib/types";

const now = () => new Date().toISOString();
const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const num = (f: FormData, k: string) => Math.round(Number(String(f.get(k) ?? "").replace(/\D/g, "")) || 0);
const refresh = () => revalidatePath("/", "layout");
const MAX_FILE = 5 * 1024 * 1024;
const STATEMENT_ERROR = { error: "Centang pernyataan bahwa data diisi dengan sebenar-benarnya." };
const fileOf = (f: FormData, k: string) => {
  const x = f.get(k);
  return x instanceof File && x.size > 0 ? x : null;
};
function checkFile(file: File) {
  if (file.size > MAX_FILE) throw new Error("Ukuran file maksimal 5 MB.");
  if (!/^(image\/(png|jpe?g|webp)|application\/pdf)$/.test(file.type)) throw new Error("File harus JPG, PNG, WEBP, atau PDF.");
}

// ---------- publik ----------

export async function donate(_: unknown, f: FormData) {
  const campaign = await one("campaigns", "id", str(f, "campaign_id"));
  const base = num(f, "amount");
  if (!campaign || campaign.status !== "aktif") return { error: "Pilih campaign yang masih berjalan." };
  if (base < 10_000) return { error: "Nominal minimal Rp10.000." };
  if (base > 1_000_000_000) return { error: "Nominal terlalu besar." };
  const code = pickUniqueCode(base, await all("donations"));
  if (code === null) return { error: "Kode unik untuk nominal ini sedang penuh. Coba nominal lain." };
  const ticket = newTicket();
  await insert("donations", {
    id: crypto.randomUUID(), ticket, campaign_id: campaign.id,
    name: str(f, "anonymous") ? "Hamba Allah" : str(f, "name", 60) || "Hamba Allah",
    contact: str(f, "contact", 100), message: str(f, "message", 280),
    base_amount: base, unique_code: code, total: base + code, status: "menunggu_transfer",
    proof_path: null, verified_at: null, verified_via: null, mutation_id: null, priority: 0,
    created_at: now(), expires_at: new Date(Date.now() + EXPIRY_HOURS * 3_600_000).toISOString(),
  });
  refresh();
  redirect(`/tiket/${ticket}?baru=1`);
}

export async function findTicket(f: FormData) {
  const code = str(f, "ticket", 20).toUpperCase().replace(/\s/g, "");
  redirect(`/tiket/${encodeURIComponent(code.startsWith("DB-") ? code : "DB-" + code.replace(/^DB/, ""))}`);
}

export async function uploadProof(_: unknown, f: FormData) {
  const d = await one("donations", "ticket", str(f, "ticket", 20));
  const file = fileOf(f, "proof");
  if (!d || !file) return { error: "Pilih file bukti transfer." };
  if (!["menunggu_transfer", "kedaluwarsa"].includes(viewStatus(d))) return { error: "Status tiket ini tidak perlu bukti lagi." };
  try {
    checkFile(file);
  } catch (e) {
    return { error: (e as Error).message };
  }
  const path = await uploadFile(BUCKET_PRIVATE, file);
  await update("donations", d.id, { proof_path: path, status: "menunggu_verifikasi" });
  refresh();
  return { ok: "Bukti terkirim. Admin akan memeriksanya, biasanya kurang dari 1x24 jam." };
}

export async function proposeCampaign(_: unknown, f: FormData) {
  const title = str(f, "title", 120);
  const organizer = str(f, "organizer", 100);
  const contact = str(f, "contact", 100);
  if (!title || !organizer || !contact) return { error: "Judul, nama lembaga, dan kontak wajib diisi." };
  const s = await all("settings");
  const ops = Number(s.find((x) => x.id === "default_ops_percent")?.value ?? 5);
  await insert("campaigns", {
    id: crypto.randomUUID(),
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) + "-" + Date.now().toString(36),
    title, category: str(f, "category", 40) || "Lainnya", location: str(f, "location", 80),
    summary: str(f, "summary", 200), story: str(f, "story", 4000), programs: [],
    image: "/img/pendampingan.jpg", image_credit: "Helena Lopes / Unsplash",
    target: num(f, "target"), ops_percent: ops, status: "pengajuan", organizer, contact, created_at: now(),
  });
  refresh();
  return { ok: "Pengajuan terkirim. Tim dibersamai.id akan menghubungi kontak yang Anda isi untuk verifikasi." };
}

export async function submitAudit(_: unknown, f: FormData) {
  const name = str(f, "name", 100);
  const organization = str(f, "organization", 120);
  const contact = str(f, "contact", 100);
  if (!name || !organization || !contact) return { error: "Nama, kantor/lembaga, dan kontak wajib diisi." };
  await insert("inquiries", { id: crypto.randomUUID(), name, organization, contact, message: str(f, "message", 2000), created_at: now() });
  refresh();
  return { ok: "Terima kasih. Tim dibersamai.id akan menghubungi Anda untuk membahas kolaborasi audit." };
}

// ---------- admin ----------

export async function adminLogin(_: unknown, f: FormData) {
  if (!(await login(str(f, "password", 200)))) return { error: "Kata sandi salah." };
  redirect("/admin");
}

export async function adminLogout() {
  await logout();
  redirect("/");
}

export async function verifyDonation(id: string, approve: boolean) {
  await requireAdmin();
  await update("donations", id, approve
    ? { status: "terverifikasi", verified_at: now(), verified_via: "admin" }
    : { status: "ditolak" });
  refresh();
}

export async function setPriority(id: string, priority: number) {
  await requireAdmin();
  await update("donations", id, { priority });
  refresh();
}

// Kolom `evidence` ditambahkan lewat migrasi manual; beri petunjuk jelas jika belum dijalankan.
function dbError(e: unknown) {
  const msg = (e as Error).message ?? String(e);
  if (/evidence/i.test(msg)) return "Database belum punya kolom bukti. Jalankan SQL migrasi di CHANGELOG.md pada Supabase, lalu coba lagi.";
  return `Gagal menyimpan ke database: ${msg}`;
}

/** Pasangan file + keterangan dari baris "Tambah bukti". Baris tanpa file dilewati. */
async function evidenceFrom(f: FormData): Promise<{ list: Evidence[] } | { error: string }> {
  const files = f.getAll("evidence");
  const captions = f.getAll("caption").map((c) => String(c).trim().slice(0, 200));
  const rows = files.map((x, i) => ({ file: x instanceof File && x.size > 0 ? x : null, caption: captions[i] ?? "" })).filter((r) => r.file);
  if (rows.length > 10) return { error: "Maksimal 10 bukti sekali simpan." };
  for (const r of rows) {
    if (!r.caption) return { error: `Isi keterangan untuk ${r.file!.name}.` };
    try {
      checkFile(r.file!);
    } catch (e) {
      return { error: `${r.file!.name}: ${(e as Error).message}` };
    }
  }
  const list: Evidence[] = [];
  try {
    for (const r of rows) list.push({ path: await uploadFile(BUCKET_PUBLIC, r.file!), caption: r.caption });
  } catch (e) {
    return { error: `Gagal mengunggah bukti: ${(e as Error).message}` };
  }
  return { list };
}

export async function addDisbursement(_: unknown, f: FormData) {
  await requireAdmin();
  const amount = num(f, "amount");
  if (!str(f, "campaign_id") || !str(f, "purpose") || amount <= 0) return { error: "Lengkapi campaign, tujuan, dan jumlah." };
  if (!str(f, "statement")) return STATEMENT_ERROR;
  const ev = await evidenceFrom(f);
  if ("error" in ev) return ev;
  try {
    await insert("disbursements", {
      id: crypto.randomUUID(), campaign_id: str(f, "campaign_id"), date: str(f, "date", 10) || now().slice(0, 10),
      purpose: str(f, "purpose", 300), amount, evidence_path: null, evidence: ev.list, created_at: now(),
    });
  } catch (e) {
    return { error: dbError(e) };
  }
  refresh();
  return { ok: `Penyaluran dicatat${ev.list.length ? ` dengan ${ev.list.length} bukti` : ""} dan dibagi ke donasi secara urut masuk.` };
}

export async function addEvidence(id: string, _: unknown, f: FormData) {
  await requireAdmin();
  const d = await one("disbursements", "id", id);
  if (!d) return { error: "Penyaluran tidak ditemukan." };
  if (!str(f, "statement")) return STATEMENT_ERROR;
  const ev = await evidenceFrom(f);
  if ("error" in ev) return ev;
  if (ev.list.length === 0) return { error: "Pilih minimal satu file bukti." };
  try {
    await update("disbursements", id, { evidence: [...(d.evidence ?? []), ...ev.list] });
  } catch (e) {
    return { error: dbError(e) };
  }
  refresh();
  return { ok: `${ev.list.length} bukti ditambahkan.` };
}

export async function addExpense(_: unknown, f: FormData) {
  await requireAdmin();
  const amount = num(f, "amount");
  if (!str(f, "description") || amount <= 0) return { error: "Lengkapi keterangan dan jumlah." };
  await insert("expenses", {
    id: crypto.randomUUID(), campaign_id: str(f, "campaign_id") || null, date: str(f, "date", 10) || now().slice(0, 10),
    kind: (str(f, "kind") as Expense["kind"]) || "operasional", description: str(f, "description", 300), amount, created_at: now(),
  });
  refresh();
  return { ok: "Biaya dicatat." };
}

export async function saveCampaign(id: string, f: FormData) {
  await requireAdmin();
  const patch: Partial<Campaign> = {
    status: str(f, "status") as Campaign["status"],
    ops_percent: Math.min(30, Math.max(0, Number(str(f, "ops_percent")) || 0)),
    target: num(f, "target"),
  };
  await update("campaigns", id, patch);
  refresh();
}

export async function saveSettings(_: unknown, f: FormData) {
  await requireAdmin();
  for (const key of ["bank_name", "bank_account", "bank_holder", "default_ops_percent"]) {
    await upsert("settings", { id: key, value: str(f, key, 120) });
  }
  const words = str(f, "whitelist", 5000).toUpperCase().match(/[A-Z0-9]+/g) ?? [];
  await upsert("settings", { id: "whitelist", value: [...new Set(words)].join(" ") });
  const qris = fileOf(f, "qris");
  if (qris) {
    try {
      checkFile(qris);
    } catch (e) {
      return { error: (e as Error).message };
    }
    const path = await uploadFile(BUCKET_PUBLIC, qris);
    await upsert("settings", { id: "qris_image", value: path });
  }
  refresh();
  return { ok: "Pengaturan disimpan." };
}

export type IncomingTx = { date: string; public_desc: string; credit: number; debit: number; balance: number; category: MutationCategory; dedupe_key: string };

/** Menerima mutasi yang sudah disensor di browser admin, lalu mencocokkan nominal ke kode unik donasi. */
export async function importMutations(source: string, rows: IncomingTx[]) {
  await requireAdmin();
  const existing = new Set((await all("mutations")).map((m) => m.dedupe_key));
  const donations = await all("donations");
  const fresh = rows.filter((r) => !existing.has(r.dedupe_key)).slice(0, 5000);
  const upload_id = crypto.randomUUID();
  const list: Mutation[] = [];
  let matched = 0;
  for (const r of fresh) {
    const m: Mutation = {
      id: crypto.randomUUID(), upload_id, date: r.date, public_desc: String(r.public_desc).slice(0, 200),
      credit: Number(r.credit) || 0, debit: Number(r.debit) || 0, balance: Number(r.balance) || 0,
      category: r.category, dedupe_key: String(r.dedupe_key).slice(0, 200), donation_id: null,
    };
    if (m.credit > 0) {
      const endOfDay = new Date(m.date + "T23:59:59+07:00").getTime();
      const d = donations
        .filter((x) => ["menunggu_transfer", "menunggu_verifikasi"].includes(x.status) && x.total === m.credit)
        .filter((x) => new Date(x.created_at).getTime() <= endOfDay)
        .filter((x) => x.status === "menunggu_verifikasi" || new Date(x.expires_at).getTime() >= new Date(m.date + "T00:00:00+07:00").getTime())
        .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
      if (d) {
        m.donation_id = d.id;
        m.category = "donasi";
        d.status = "terverifikasi";
        await update("donations", d.id, { status: "terverifikasi", verified_at: now(), verified_via: "mutasi", mutation_id: m.id });
        matched++;
      }
    }
    list.push(m);
  }
  if (list.length) await insert("mutations", list);
  await insert("uploads", { id: upload_id, source, uploaded_at: now(), count: list.length });
  refresh();
  return { added: list.length, skipped: rows.length - fresh.length, matched };
}

export async function setMutationCategory(id: string, category: MutationCategory) {
  await requireAdmin();
  await update("mutations", id, { category });
  refresh();
}
