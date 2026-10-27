# dibersamai.id

Crowdfunding pemulihan fisik dan mental korban bencana, dengan tiket untuk melacak setiap donasi: diterima, terverifikasi, tersalurkan, dan buktinya.

## Menjalankan di laptop

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Tanpa kunci Supabase, app berjalan dalam **mode demo**: data contoh di memori, hilang saat server dimatikan.

- Admin: http://localhost:3000/admin, kata sandi demo `admin`
- Tiket contoh yang sudah tersalurkan: `DB-DEMO01`; yang masih menunggu transfer: `DB-DEMO02`
- PDF mutasi contoh untuk uji unggah: `public/contoh/mutasi-contoh.pdf`

## Menyambungkan Supabase

1. Buat project di supabase.com.
2. SQL Editor: jalankan `supabase/schema.sql`, lalu `supabase/campaigns.sql` (4 campaign contoh, tanpa donasi palsu).
3. Salin `.env.example` jadi `.env.local`, isi `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SECRET`.
4. Jalankan ulang `npm run dev`. Banner mode demo hilang.

Service role key hanya dipakai di server dan tidak pernah dikirim ke browser. Jangan commit `.env.local`.

## Deploy ke Vercel

Push repo ini ke GitHub, import di Vercel, lalu isi environment variables yang sama dengan `.env.local`.
Mode demo di Vercel tidak cocok untuk dipakai sungguhan, karena tiap instance server punya memori sendiri.

## Cara kerja

- **Kode unik**: nominal + 3 digit acak (1-999) yang belum dipakai donasi aktif lain dengan nominal sama. Berlaku 24 jam.
- **Verifikasi**: admin mengunggah PDF mutasi. PDF dibaca dan disensor di browser admin (`src/lib/mutasi.ts`); server hanya menerima keterangan tersensor dan nominal. Uang masuk yang nominalnya persis sama dengan donasi yang menunggu langsung memverifikasinya. Donatur juga bisa unggah bukti transfer (privat, hanya admin) untuk diperiksa manual.
- **Penyaluran**: dibagi ke donasi terverifikasi secara urut masuk (FIFO). Admin bisa menaikkan prioritas donasi tertentu (`allocate` di `src/lib/logic.ts`).
- **Operasional**: tiap campaign punya persen batas atas (diatur admin). Dashboard menampilkan anggaran, yang terpakai, dan sisanya.

## Batasan yang diketahui

- Parser mutasi baru mengenali baris `tanggal keterangan nominal [DB/CR] saldo`. Format bank asli perlu dicek dan disesuaikan.
- Dua donasi dengan total persis sama dalam 24 jam tidak mungkin terjadi (kode unik dijaga), tapi transfer yang nominalnya keliru tidak akan cocok otomatis.
- Login admin memakai satu kata sandi bersama. Untuk banyak admin, ganti ke Supabase Auth.
- Aturan hukum pengumpulan uang/barang (izin PUB) belum dicek.
