-- Skema database dibersamai.id. Jalankan sekali di Supabase: SQL Editor > New query > tempel > Run.
-- Semua akses lewat server Next.js dengan service role key, jadi RLS aktif tanpa policy publik.

create table if not exists campaigns (
  id text primary key,
  slug text unique not null,
  title text not null,
  category text not null default '',
  location text not null default '',
  summary text not null default '',
  story text not null default '',
  programs text[] not null default '{}',
  image text not null default '',
  image_credit text not null default '',
  target bigint not null default 0,
  ops_percent numeric not null default 5,
  status text not null default 'pengajuan' check (status in ('aktif','pengajuan','ditolak','selesai')),
  organizer text not null default '',
  contact text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists donations (
  id text primary key,
  ticket text unique not null,
  campaign_id text not null references campaigns(id),
  name text not null default 'Hamba Allah',
  contact text not null default '',
  message text not null default '',
  base_amount bigint not null,
  unique_code int not null,
  total bigint not null,
  status text not null check (status in ('menunggu_transfer','menunggu_verifikasi','terverifikasi','ditolak')),
  proof_path text,
  verified_at timestamptz,
  verified_via text,
  mutation_id text,
  priority int not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists donations_total_status on donations(total, status);

create table if not exists disbursements (
  id text primary key,
  campaign_id text not null references campaigns(id),
  date date not null,
  purpose text not null,
  amount bigint not null,
  evidence_path text,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id text primary key,
  campaign_id text references campaigns(id),
  date date not null,
  kind text not null check (kind in ('promosi','operasional')),
  description text not null,
  amount bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists uploads (
  id text primary key,
  source text not null,
  uploaded_at timestamptz not null default now(),
  count int not null default 0
);

-- Hanya data tersensor. Keterangan mentah mutasi tidak pernah disimpan di sini.
create table if not exists mutations (
  id text primary key,
  upload_id text references uploads(id),
  date date not null,
  public_desc text not null,
  credit bigint not null default 0,
  debit bigint not null default 0,
  balance bigint not null default 0,
  category text not null,
  dedupe_key text unique not null,
  donation_id text references donations(id)
);

create table if not exists settings (
  id text primary key,
  value text not null
);

alter table campaigns enable row level security;
alter table donations enable row level security;
alter table disbursements enable row level security;
alter table expenses enable row level security;
alter table uploads enable row level security;
alter table mutations enable row level security;
alter table settings enable row level security;

-- Storage: bukti penyaluran publik, bukti transfer donatur privat.
insert into storage.buckets (id, name, public) values ('bukti-penyaluran', 'bukti-penyaluran', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('bukti-donatur', 'bukti-donatur', false) on conflict do nothing;

-- Pengaturan awal (ganti lewat halaman admin > Pengaturan).
insert into settings (id, value) values
  ('bank_name', 'Nama bank'),
  ('bank_account', '0000000000'),
  ('bank_holder', 'Yayasan Dibersamai Indonesia'),
  ('qris_image', '/img/qris-demo.svg'),
  ('default_ops_percent', '5'),
  ('whitelist', 'TRANSFER TRF DARI KE DAN DI DONASI BIAYA ADM ADMIN BUNGA PAJAK SETORAN TUNAI BI FAST BIFAST QRIS VA VIRTUAL ACCOUNT PEMINDAHBUKUAN KARTU DEBIT PEMBAYARAN PENYALURAN PLATFORM FEE SETTLEMENT ONLINE ATM BANK PROGRAM BULANAN POTONGAN SALDO KONSELOR IKLAN OPERASIONAL')
on conflict (id) do nothing;
