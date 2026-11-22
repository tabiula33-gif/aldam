import { NextResponse } from "next/server";
import { db, type Order, type Product } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS = 20;

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{48}$/.test(token)) return new NextResponse("Not found", { status: 404 });

  const { data: o } = await db().from("orders").select("*").eq("download_token", token).maybeSingle();
  const order = o as Order | null;
  if (!order || order.status !== "paid") return new NextResponse("Not found", { status: 404 });
  if (order.download_count >= MAX_DOWNLOADS) {
    return new NextResponse("Download limit reached. Please contact the shop.", { status: 429 });
  }

  const { data: p } = await db().from("products").select("*").eq("id", order.product_id).single();
  const product = p as Product;
  if (!product.file_path) return new NextResponse("File not available yet", { status: 404 });

  const fileName = product.file_path.split("/").pop();
  const { data: signed, error } = await db()
    .storage.from("files")
    .createSignedUrl(product.file_path, 60, { download: fileName });
  if (error || !signed) return new NextResponse("Could not prepare download", { status: 500 });

  await db().from("orders").update({ download_count: order.download_count + 1 }).eq("id", order.id);
  return NextResponse.redirect(signed.signedUrl);
}
