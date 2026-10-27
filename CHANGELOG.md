# Catatan perubahan

## 2026-10-28 — Admin › Mutasi: keterangan asli disamarkan

- Kolom **Keterangan asli (lokal)** di pratinjau impor kini tersamar secara bawaan: kata di whitelist tetap utuh, kata lain hanya menyisakan huruf pertama (`MUHAMAD` → `M••••••`, nomor rekening → `0•••••••••••`). Nama dan nomor rekening tidak terbaca saat layar terlihat orang lain atau dibagikan.
- Tombol **Tampilkan / Samarkan** di judul kolom membuka keterangan lengkap sementara untuk memeriksa sensor. Setiap PDF baru kembali tersamar.

## 2026-10-28 — Perbaikan: error saat mengunggah mutasi CIMB Niaga

Penyebab: kolom `credit`, `debit`, dan `balance` di tabel `mutations` bertipe `bigint`, sedangkan statement CIMB Niaga mencantumkan sen (`4,919,083.99`). Supabase menolak simpan dan halaman menampilkan "An error occurred in the Server Components render".

- Nilai rupiah kini **dibulatkan ke rupiah terdekat** di server sebelum disimpan. Tidak perlu migrasi database.
- Pencocokan donasi lewat nominal unik tidak terpengaruh karena nominal donasi selalu bulat.

## 2026-10-28 — Perbaikan: "Application error" saat menyimpan penyaluran

Penyebab: Vercel menolak kiriman di atas 4,5 MB sebelum sampai ke aplikasi (HTTP 413). Beberapa foto langsung dari HP melewati batas itu, dan browser berhenti dengan "Application error: a client-side exception has occurred".

- **Foto diperkecil otomatis** di browser sebelum diunggah (sisi terpanjang 1600 px, JPEG). Foto HP belasan MB jadi sekitar 0,5 MB. PDF tidak diubah.
- **Batas total 4 MB sekali simpan** diperiksa sebelum mengirim. Jika lewat, muncul pesan jelas. Sisanya bisa diunggah lewat "Tambah bukti".
- **Kegagalan simpan tampil sebagai pesan**, bukan halaman error. Termasuk pesan khusus jika migrasi kolom `evidence` belum dijalankan di Supabase.

## 2026-10-28 — Parser mutasi: dukung CIMB Niaga

### Admin › Mutasi

- **PDF statement CIMB Niaga (OCTO) kini terbaca.** Sebelumnya muncul "Tidak ada transaksi yang dikenali". Diuji dengan statement Agustus 2026: 37 transaksi terbaca, total kredit/debit sama persis dengan ringkasan statement, saldo berantai tanpa selisih.
- Tanggal dengan nama bulan (`01 Aug 2026`, `1 Agustus 2026`, singkatan Indonesia seperti `Agu`, `Okt`, `Des`) kini dikenali.
- Jumlah bertanda minus (`-500,000.00`) dibaca sebagai debit.
- Baris ringkasan di akhir statement (Saldo Awal/Akhir, Total Debit/Kredit, IMPORTANT!) dan baris jam (`08:39:06`) tidak lagi ikut tersambung ke keterangan transaksi.
- Format lama (`DD/MM/YYYY ... DB/CR saldo`) tetap didukung.

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
