export type CampaignStatus = "aktif" | "pengajuan" | "ditolak" | "selesai";

export type Campaign = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  summary: string;
  story: string;
  programs: string[];
  image: string;
  image_credit: string;
  target: number;
  ops_percent: number;
  status: CampaignStatus;
  organizer: string;
  contact: string;
  created_at: string;
};

export type DonationStatus = "menunggu_transfer" | "menunggu_verifikasi" | "terverifikasi" | "ditolak";

export type Donation = {
  id: string;
  ticket: string;
  campaign_id: string;
  name: string;
  contact: string;
  message: string;
  base_amount: number;
  unique_code: number;
  total: number;
  status: DonationStatus;
  proof_path: string | null;
  verified_at: string | null;
  verified_via: "mutasi" | "admin" | null;
  mutation_id: string | null;
  priority: number;
  created_at: string;
  expires_at: string;
};

export type Disbursement = {
  id: string;
  campaign_id: string;
  date: string;
  purpose: string;
  amount: number;
  evidence_path: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  campaign_id: string | null;
  date: string;
  kind: "promosi" | "operasional";
  description: string;
  amount: number;
  created_at: string;
};

export type MutationCategory = "donasi" | "penyaluran" | "operasional" | "biaya_bank" | "lainnya";

export type Mutation = {
  id: string;
  upload_id: string;
  date: string;
  public_desc: string;
  credit: number;
  debit: number;
  balance: number;
  category: MutationCategory;
  dedupe_key: string;
  donation_id: string | null;
};

export type Upload = { id: string; source: string; uploaded_at: string; count: number };

export type Setting = { id: string; value: string };

export type Settings = {
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  qris_image: string;
  default_ops_percent: number;
  whitelist: string[];
};

export type Tables = {
  campaigns: Campaign;
  donations: Donation;
  disbursements: Disbursement;
  expenses: Expense;
  mutations: Mutation;
  uploads: Upload;
  settings: Setting;
};
