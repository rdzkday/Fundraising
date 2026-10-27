// Parser mutasi rekening dan sensor identitas. Dipakai di browser admin:
// data mentah (nama, nomor rekening) tidak pernah dikirim ke server.

export type ParsedTx = { date: string; raw: string; debit: number; credit: number; balance: number };

const NUM = String.raw`\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?`;
// Tanggal: 01/08/2026, 01-08-26, atau 01 Aug 2026 / 1 Agustus 2026 (CIMB Niaga, Mandiri, dll).
const DATE = String.raw`\d{2}[/-]\d{2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\.?\s+\d{4}`;
// Jumlah bisa bertanda minus (debit) seperti di CIMB Niaga: -500,000.00
const LINE = new RegExp(
  String.raw`^(${DATE})\s+(.*?)\s+(-?)(${NUM})\s*(DB|CR|DR|D|K)?\s+(${NUM})\s*$`,
  "i",
);
// Ringkasan/penutup di akhir laporan: setelah ini baris tidak lagi disambung ke keterangan.
const FOOTER = /^(saldo\s+(awal|akhir)|total\s+(debit|kredit)|opening\s+balance|closing\s+balance|important\b)/i;
const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", mei: "05", jun: "06", jul: "07",
  aug: "08", agu: "08", agt: "08", sep: "09", oct: "10", okt: "10", nov: "11", dec: "12", des: "12",
};
const ACCOUNT = /(?:no\.?\s*rek(?:ening)?|account\s*(?:no\.?|number))\s*:?\s*([\d\- ]{6,})/i;

export function parseAmount(s: string) {
  const last = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
  if (last < 0) return Number(s);
  const tail = s.slice(last + 1);
  if (tail.length === 3) return Number(s.replace(/[.,]/g, "")); // pemisah ribuan
  return Number(s.slice(0, last).replace(/[.,]/g, "") + "." + tail);
}

function parseDate(s: string) {
  let [d, m, y] = s.split(/[/-]/);
  if (!m) {
    [d, m, y] = s.split(/\s+/);
    m = MONTHS[m.slice(0, 3).toLowerCase()];
    if (!m) return null;
  }
  d = d.padStart(2, "0");
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
  let closed = false;
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
      const amt = parseAmount(m[4]);
      const bal = parseAmount(m[6]);
      const flag = (m[5] ?? "").toUpperCase();
      const credit = m[3] === "-" ? false
        : ["CR", "K"].includes(flag) ? true : ["DB", "DR", "D"].includes(flag) ? false : prev === null ? true : bal >= prev;
      txs.push({ date, raw: m[2].trim(), debit: credit ? 0 : amt, credit: credit ? amt : 0, balance: bal });
      prev = bal;
      closed = false;
    } else if (FOOTER.test(line)) {
      closed = true;
    } else if (txs.length && !closed && !/^(halaman|page|saldo|tanggal|date)\b/i.test(line) && !/^\d{2}:\d{2}(:\d{2})?$/.test(line)) {
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
