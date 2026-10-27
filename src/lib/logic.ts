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

export type CampaignStats = { raised: number; donors: number; disbursed: number; ops: number };

export function summarize(campaigns: Campaign[], donations: Donation[], disbursements: Disbursement[], expenses: Expense[]) {
  const byId = new Map(campaigns.map((c) => [c.id, c]));
  const verified = donations.filter((d) => d.status === "terverifikasi");
  const per = new Map<string, CampaignStats>(campaigns.map((c) => [c.id, { raised: 0, donors: 0, disbursed: 0, ops: 0 }]));
  for (const d of verified) {
    const s = per.get(d.campaign_id);
    if (!s) continue;
    s.raised += d.total;
    s.donors += 1;
    s.ops += opsShare(d, byId.get(d.campaign_id));
  }
  for (const x of disbursements) {
    const s = per.get(x.campaign_id);
    if (s) s.disbursed += x.amount;
  }
  const masuk = verified.reduce((a, d) => a + d.total, 0);
  const tersalurkan = disbursements.reduce((a, d) => a + d.amount, 0);
  const opsBudget = [...per.values()].reduce((a, s) => a + s.ops, 0);
  const opsUsed = expenses.reduce((a, e) => a + e.amount, 0);
  return {
    masuk,
    tersalurkan,
    opsBudget,
    opsUsed,
    tersimpan: masuk - tersalurkan - opsUsed,
    donors: verified.length,
    per,
  };
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
