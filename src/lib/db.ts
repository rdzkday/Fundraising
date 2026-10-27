// Penyimpanan data. Tanpa kunci Supabase, app berjalan dalam mode demo (data contoh di memori).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { seed } from "./seed";
import type { Evidence, Tables } from "./types";

type Name = keyof Tables;

// Hanya dipakai di server. NEXT_PUBLIC_SUPABASE_URL tetap diterima untuk konfigurasi lama.
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const isDemo = !(url && serviceKey);

// Bukti transfer donatur memuat nama & rekening, jadi disimpan privat. Bukti penyaluran publik.
export const BUCKET_PRIVATE = "bukti-donatur";
export const BUCKET_PUBLIC = "bukti-penyaluran";

let client: SupabaseClient | null = null;
function sb() {
  if (!client) client = createClient(url!, serviceKey!, { auth: { persistSession: false } });
  return client;
}

type Store = { [K in Name]: Tables[K][] } & { files: Record<string, string> };
const g = globalThis as unknown as { __dbsStore?: Store };
function demo(): Store {
  if (!g.__dbsStore) g.__dbsStore = { ...seed(), files: {} };
  return g.__dbsStore;
}

export async function all<K extends Name>(table: K): Promise<Tables[K][]> {
  if (isDemo) return structuredClone(demo()[table]) as Tables[K][];
  const { data, error } = await sb().from(table).select("*");
  if (error) throw new Error(`${table}: ${error.message}`);
  return data as Tables[K][];
}

export async function one<K extends Name>(table: K, col: string, value: string): Promise<Tables[K] | null> {
  if (isDemo) {
    const row = (demo()[table] as Record<string, unknown>[]).find((r) => r[col] === value);
    return row ? (structuredClone(row) as Tables[K]) : null;
  }
  const { data, error } = await sb().from(table).select("*").eq(col, value).maybeSingle();
  if (error) throw new Error(`${table}: ${error.message}`);
  return data as Tables[K] | null;
}

export async function insert<K extends Name>(table: K, rows: Tables[K] | Tables[K][]) {
  const list = Array.isArray(rows) ? rows : [rows];
  if (isDemo) {
    (demo()[table] as Tables[K][]).push(...structuredClone(list));
    return;
  }
  const { error } = await sb().from(table).insert(list);
  if (error) throw new Error(`${table}: ${error.message}`);
}

export async function update<K extends Name>(table: K, id: string, patch: Partial<Tables[K]>) {
  if (isDemo) {
    const row = (demo()[table] as { id: string }[]).find((r) => r.id === id);
    if (row) Object.assign(row, patch);
    return;
  }
  const { error } = await sb().from(table).update(patch).eq("id", id);
  if (error) throw new Error(`${table}: ${error.message}`);
}

export async function upsert<K extends Name>(table: K, row: Tables[K] & { id: string }) {
  if (isDemo) {
    const rows = demo()[table] as { id: string }[];
    const i = rows.findIndex((r) => r.id === row.id);
    if (i >= 0) rows[i] = row;
    else rows.push(row);
    return;
  }
  const { error } = await sb().from(table).upsert(row);
  if (error) throw new Error(`${table}: ${error.message}`);
}

export async function uploadFile(bucket: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  if (isDemo) {
    const buf = Buffer.from(await file.arrayBuffer());
    demo().files[`${bucket}/${path}`] = `data:${file.type};base64,${buf.toString("base64")}`;
    return path;
  }
  const { error } = await sb().storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw new Error(`upload: ${error.message}`);
  return path;
}

/** Bukti penyaluran beserta URL publiknya. */
export async function evidenceUrls(list: Evidence[]) {
  return Promise.all(list.map(async (e) => ({ ...e, url: await fileUrl(BUCKET_PUBLIC, e.path) })));
}

export async function fileUrl(bucket: string, path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("/")) return path; // file statis contoh di /public
  if (isDemo) return demo().files[`${bucket}/${path}`] ?? null;
  if (bucket === BUCKET_PUBLIC) return sb().storage.from(bucket).getPublicUrl(path).data.publicUrl;
  const { data } = await sb().storage.from(bucket).createSignedUrl(path, 600);
  return data?.signedUrl ?? null;
}
