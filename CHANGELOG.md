# Catatan perubahan

## 2026-10-28 — Revisi halaman Penyaluran

### Wajib sebelum deploy

Jalankan sekali di Supabase (SQL Editor) supaya bukti penyaluran bisa lebih dari satu:

```sql
alter table disbursements add column if not exists evidence jsonb not null default '[]'::jsonb;
```

Tanpa kolom ini, menyimpan penyaluran yang memakai bukti akan gagal.

### Admin › Penyaluran

- **Ringkasan dana.** Empat kartu di atas form: dana masuk (terverifikasi), promosi & operasional, sudah disalurkan, dan **sisa dana** yang siap disalurkan.
- **Bukti bisa lebih dari satu.** Tombol "+ Tambah bukti" menambah satu baris berisi file dan keterangan. Keterangan wajib diisi, gambar langsung tampil sebagai pratinjau, dan baris bisa dihapus. Batasnya 10 file per simpan, 5 MB per file (JPG, PNG, WEBP, PDF).
- **Riwayat penyaluran dengan galeri bukti.** Tabel lama diganti kartu per penyaluran yang menampilkan semua bukti beserta keterangannya. Tiap kartu punya "Tambah bukti" untuk melengkapi bukti belakangan.
- **Pernyataan wajib.** Form penyaluran dan form tambah bukti hanya bisa disimpan setelah admin mencentang pernyataan bahwa data diisi dengan sebenar-benarnya dan dapat dipertanggungjawabkan secara hukum. Server ikut memeriksanya.

### Halaman publik

- Detail pencairan di halaman project/pendanaan dan langkah "Bukti penyaluran" di halaman tiket donatur kini menampilkan semua bukti beserta keterangannya.
- Bukti lama (kolom `evidence_path`) tetap tampil.

### Semua form admin & publik

- Isian form tidak lagi terhapus saat simpan gagal (mis. file terlalu besar atau pernyataan belum dicentang). Form baru dikosongkan setelah berhasil.
