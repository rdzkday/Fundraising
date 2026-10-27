import { all } from "./db";
import { DEFAULT_WHITELIST } from "./seed";
import type { Campaign, Disbursement, Donation, Expense, Settings } from "./types";

export const EXPIRY_HOURS = 24;

export async function getSettings(): Promise<Settings> {
  const rows = Object.fromEntries((await all("settings")).map((r) => [r.id, r.value]));
  return {
    bank_name: rows.bank_name ?? "",
    bank_account: rows.bank_account ?? "",
    bank_holder: rows.bank_holder ?? "",
    qris_image: rows.qris_image ?? "",
    default_ops_percent: Number(rows.default_ops_percent ?? 5),
    whitelist: (rows.whitelist ?? DEFAULT_WHITELIST).split(/\s+/).filter(Boolean),
  };
}

export type ViewStatus = Donation["status"] | "kedaluwarsa";

export function viewStatus(d: Donation, now = Date.now()): ViewStatus {
  if (d.status === "menunggu_transfer" && new Date(d.expires_at).getTime() < now) return "kedaluwarsa";
  return d.status;
}

export const STATUS_LABEL: Record<ViewStatus, string> = {
  menunggu_transfer: "Menunggu transfer",
  menunggu_verifikasi: "Menunggu verifikasi admin",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
  kedaluwarsa: "Kedaluwarsa",
};

/** Kode unik 1-999 yang belum dipakai donasi aktif lain dengan nominal dasar yang sama. */
export function pickUniqueCode(base: number, donations: Donation[]): number | null {
  const taken = new Set(
    donations
      .filter((d) => ["menunggu_transfer", "menunggu_verifikasi"].includes(viewStatus(d)))
      .map((d) => d.total),
  );
  const free: number[] = [];
  for (let c = 1; c <= 999; c++) if (!taken.has(base + c)) free.push(c);
  return free.length ? free[Math.floor(Math.random() * free.length)] : null;
}

export function newTicket() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "DB-" + Array.from(bytes, (b) => abc[b % abc.length]).join("");
}

export const opsShare = (d: Donation, c?: Campaign) => Math.round((d.total * (c?.ops_percent ?? 5)) / 100);

export type Allocation = { disbursement: Disbursement; amount: number };

/**
 * Penyaluran dibagi ke donasi terverifikasi secara urut masuk (FIFO).
 * Donasi dengan prioritas lebih tinggi dari admin didahulukan.
 */
export function allocate(campaign: Campaign, donations: Donation[], disbursements: Disbursement[]) {
  const queue = donations
    .filter((d) => d.campaign_id === campaign.id && d.status === "terverifikasi")
    .sort((a, b) => b.priority - a.priority || (a.verified_at ?? "").localeCompare(b.verified_at ?? ""))
    .map((d) => ({ d, left: d.total - opsShare(d, campaign) }));
  const result = new Map<string, Allocation[]>();
  const outs = disbursements
    .filter((s) => s.campaign_id === campaign.id)
    .sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at));
  let i = 0;
  for (const s of outs) {
    let need = s.amount;
    while (need > 0 && i < queue.length) {
      const q = queue[i];
      const take = Math.min(need, q.left);
      if (take > 0) {
        result.set(q.d.id, [...(result.get(q.d.id) ?? []), { disbursement: s, amount: take }]);
        q.left -= take;
        need -= take;
      }
      if (q.left <= 0) i++;
    }
  }
  return result;
}

/** Arus kas satu project, atau seluruh dibersamai.id. Promosi dan operasional dicatat terpisah. */
export type Flow = {
  masuk: number;
  donors: number;
  tersalurkan: number;
  promosi: number;
  operasional: number;
  /** Batas atas promosi + operasional dari persen per donasi. */
  budget: number;
  tersimpan: number;
};

const emptyFlow = (): Flow => ({ masuk: 0, donors: 0, tersalurkan: 0, promosi: 0, operasional: 0, budget: 0, tersimpan: 0 });

export function summarize(campaigns: Campaign[], donations: Donation[], disbursements: Disbursement[], expenses: Expense[]) {
  const byId = new Map(campaigns.map((c) => [c.id, c]));
  const per = new Map<string, Flow>(campaigns.map((c) => [c.id, emptyFlow()]));
  const total = emptyFlow();
  for (const d of donations.filter((x) => x.status === "terverifikasi")) {
    const budget = opsShare(d, byId.get(d.campaign_id));
    for (const f of [per.get(d.campaign_id), total]) {
      if (!f) continue;
      f.masuk += d.total;
      f.donors += 1;
      f.budget += budget;
    }
  }
  for (const x of disbursements) {
    for (const f of [per.get(x.campaign_id), total]) if (f) f.tersalurkan += x.amount;
  }
  // Biaya tanpa project (umum) hanya masuk ke total keseluruhan.
  for (const e of expenses) {
    for (const f of [e.campaign_id ? per.get(e.campaign_id) : undefined, total]) if (f) f[e.kind] += e.amount;
  }
  for (const f of [...per.values(), total]) f.tersimpan = f.masuk - f.tersalurkan - f.promosi - f.operasional;
  return { total, per };
}

export async function loadAll() {
  const [campaigns, donations, disbursements, expenses] = await Promise.all([
    all("campaigns"),
    all("donations"),
    all("disbursements"),
    all("expenses"),
  ]);
  return { campaigns, donations, disbursements, expenses, summary: summarize(campaigns, donations, disbursements, expenses) };
}
