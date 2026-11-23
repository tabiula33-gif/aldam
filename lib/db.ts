import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Server-side Supabase client using the service role key. Never import from client components. */
export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export type Product = {
  id: string;
  seller_id: string;
  slug: string;
  kind: "pdf" | "planner" | "course";
  title_mn: string;
  title_en: string;
  description_mn: string;
  description_en: string;
  title_mong?: string | null;
  description_mong?: string | null;
  price_mnt: number;
  compare_at_mnt?: number | null; // optional "was" price for sales
  cover_path: string | null;
  file_path: string | null;
  active: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  product_id: string;
  email: string;
  amount_mnt: number;
  status: "pending" | "paid" | "cancelled";
  provider: "qpay" | "test";
  provider_invoice_id: string | null;
  qr_image: string | null;
  payment_urls: { name: string; description?: string; logo?: string; link: string }[];
  download_token: string;
  download_count: number;
  created_at: string;
  paid_at: string | null;
};

export function coverUrl(path: string | null): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/${path}`;
}

export async function activeProducts(): Promise<Product[]> {
  const { data, error } = await db()
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function productBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await db().from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

/** Product ids ordered by number of paid orders (most sold first). */
export async function bestSellerIds(limit = 500): Promise<string[]> {
  const { data, error } = await db()
    .from("orders")
    .select("product_id")
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  const counts = new Map<string, number>();
  for (const r of data as { product_id: string }[]) counts.set(r.product_id, (counts.get(r.product_id) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

export function discountPercent(p: Product): number | null {
  if (!p.compare_at_mnt || p.compare_at_mnt <= p.price_mnt) return null;
  return Math.round((1 - p.price_mnt / p.compare_at_mnt) * 100);
}
