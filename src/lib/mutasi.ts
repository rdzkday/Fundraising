// Parser mutasi rekening dan sensor identitas. Dipakai di browser admin:
// data mentah (nama, nomor rekening) tidak pernah dikirim ke server.

export type ParsedTx = { date: string; raw: string; debit: number; credit: number; balance: number };

const NUM = String.raw`\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?`;
const LINE = new RegExp(
  String.raw`^(\d{2}[/-]\d{2}[/-]\d{2,4})\s+(.*?)\s+(${NUM})\s*(DB|CR|DR|D|K)?\s+(${NUM})\s*$`,
  "i",
);
const ACCOUNT = /(?:no\.?\s*rek(?:ening)?|account\s*(?:no\.?|number))\s*:?\s*([\d\- ]{6,})/i;

export function parseAmount(s: string) {
  const last = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
  if (last < 0) return Number(s);
  const tail = s.slice(last + 1);
  if (tail.length === 3) return Number(s.replace(/[.,]/g, "")); // pemisah ribuan
  return Number(s.slice(0, last).replace(/[.,]/g, "") + "." + tail);
}

function parseDate(s: string) {
  const [d, m, y] = s.split(/[/-]/);
  const year = y.length === 2 ? "20" + y : y;
  const iso = `${year}-${m}-${d}`;
  return isNaN(new Date(iso).getTime()) ? null : iso;
}

export const maskAccount = (n: string) => {
  const digits = n.replace(/\D/g, "");
  return digits.length >= 4 ? "****" + digits.slice(-4) : "****";
};

export function parseLines(lines: string[]) {
  let account = "****";
  let prev: number | null = null;
  const txs: ParsedTx[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const acc = line.match(ACCOUNT);
    if (acc && account === "****") {
      account = maskAccount(acc[1]);
      continue;
    }
    const m = line.match(LINE);
    const date = m && parseDate(m[1]);
    if (m && date) {
      const amt = parseAmount(m[3]);
      const bal = parseAmount(m[5]);
      const flag = (m[4] ?? "").toUpperCase();
      const credit = ["CR", "K"].includes(flag) ? true : ["DB", "DR", "D"].includes(flag) ? false : prev === null ? true : bal >= prev;
      txs.push({ date, raw: m[2].trim(), debit: credit ? 0 : amt, credit: credit ? amt : 0, balance: bal });
      prev = bal;
    } else if (txs.length && !/^(halaman|page|saldo|tanggal|date)\b/i.test(line)) {
      txs[txs.length - 1].raw += " " + line; // baris lanjutan keterangan
    }
  }
  return { account, txs };
}

/** Hanya kata di whitelist yang tampil; nama, nomor, dan kode jadi blok sensor. */
export function censor(raw: string, whitelist: string[]) {
  const wl = new Set(whitelist.map((w) => w.toUpperCase()));
  const out: string[] = [];
  for (const tok of raw.match(/[A-Za-z0-9]+/g) ?? []) {
    if (wl.has(tok.toUpperCase())) out.push(tok.toUpperCase());
    else if (out[out.length - 1] !== "███") out.push("███");
  }
  return out.join(" ");
}

export function guessCategory(raw: string, credit: number) {
  const u = raw.toUpperCase();
  if (/\b(ADM|BIAYA|PAJAK|BUNGA)\b/.test(u)) return "biaya_bank" as const;
  if (/\b(IKLAN|ADS|SERVER|DOMAIN|OPERASIONAL)\b/.test(u)) return "operasional" as const;
  return credit > 0 ? ("lainnya" as const) : ("penyaluran" as const);
}
