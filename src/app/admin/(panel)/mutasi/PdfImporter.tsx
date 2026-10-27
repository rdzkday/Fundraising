"use client";

import { useState } from "react";
import { importMutations, type IncomingTx } from "@/app/actions";
import { Notice } from "@/components/ui";
import { rp } from "@/lib/format";
import { censor, guessCategory, parseLines, type ParsedTx } from "@/lib/mutasi";

/** Membaca PDF di browser: baris disusun ulang dari posisi teks di halaman. */
async function pdfLines(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const content = await (await doc.getPage(p)).getTextContent();
    const rows = new Map<number, { x: number; s: string }[]>();
    for (const it of content.items) {
      if (!("str" in it) || !it.str.trim()) continue;
      const y = Math.round(it.transform[5] / 3) * 3;
      rows.set(y, [...(rows.get(y) ?? []), { x: it.transform[4], s: it.str }]);
    }
    [...rows.entries()].sort((a, b) => b[0] - a[0]).forEach(([, r]) => lines.push(r.sort((a, b) => a.x - b.x).map((x) => x.s).join(" ")));
  }
  return lines;
}

export function PdfImporter({ whitelist }: { whitelist: string[] }) {
  const [account, setAccount] = useState("");
  const [txs, setTxs] = useState<ParsedTx[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");

  async function onFile(file?: File) {
    setError(""); setResult(""); setTxs([]);
    if (!file) return;
    setBusy(true);
    try {
      const parsed = parseLines(await pdfLines(file));
      if (!parsed.txs.length) setError("Tidak ada transaksi yang dikenali. Format bank ini mungkin belum didukung parser.");
      setAccount(parsed.account);
      setTxs(parsed.txs);
    } catch (e) {
      setError("PDF tidak bisa dibaca: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    setBusy(true);
    const rows: IncomingTx[] = txs.map((t) => ({
      date: t.date, public_desc: censor(t.raw, whitelist), credit: t.credit, debit: t.debit, balance: t.balance,
      category: guessCategory(t.raw, t.credit), dedupe_key: `${t.date}|${t.credit}|${t.debit}|${t.balance}`,
    }));
    try {
      const r = await importMutations(account, rows);
      setResult(`${r.added} transaksi baru tersimpan, ${r.skipped} sudah ada sebelumnya, ${r.matched} donasi terverifikasi otomatis lewat kode unik.`);
      setTxs([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-line p-8 text-center hover:border-brand">
        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        <span className="font-bold">{busy ? "Memproses..." : "Pilih PDF mutasi rekening"}</span>
        <span className="mt-1 block text-sm text-muted">Dibaca di browser ini. File dan keterangan mentahnya tidak dikirim ke server.</span>
      </label>
      {error && <Notice kind="error">{error}</Notice>}
      {result && <Notice kind="ok">{result}</Notice>}
      {txs.length > 0 && (
        <>
          <p className="text-sm">
            Rekening <b>{account}</b> · {txs.length} transaksi terbaca. Periksa kolom <b>Tampil publik</b>: pastikan tidak ada nama atau nomor yang lolos.
            Kolom keterangan asli hanya tampil di layar ini.
          </p>
          <div className="max-h-[420px] overflow-auto rounded-2xl border border-line">
            <table className="tbl min-w-[760px]">
              <thead className="sticky top-0 bg-white"><tr><th>Tanggal</th><th>Keterangan asli (lokal)</th><th>Tampil publik</th><th>Masuk</th><th>Keluar</th></tr></thead>
              <tbody>
                {txs.map((t, i) => (
                  <tr key={i}>
                    <td className="whitespace-nowrap">{t.date}</td>
                    <td className="text-xs text-muted">{t.raw}</td>
                    <td className="font-mono text-xs">{censor(t.raw, whitelist)}</td>
                    <td className="whitespace-nowrap">{t.credit ? rp(t.credit) : ""}</td>
                    <td className="whitespace-nowrap">{t.debit ? rp(t.debit) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn" onClick={send} disabled={busy}>{busy ? "Mengunggah..." : "Unggah data tersensor & cocokkan donasi"}</button>
        </>
      )}
    </div>
  );
}
