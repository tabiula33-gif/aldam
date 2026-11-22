import { NextResponse } from "next/server";
import { getOrder, refreshOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  const fresh = await refreshOrder(order).catch(() => order);
  return NextResponse.json({
    status: fresh.status,
    download_token: fresh.status === "paid" ? fresh.download_token : null,
  });
}
