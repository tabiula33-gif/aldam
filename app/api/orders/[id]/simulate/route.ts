import { NextResponse } from "next/server";
import { getOrder, simulatePayment } from "@/lib/orders";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const paid = await simulatePayment(order);
    return NextResponse.json({ status: paid.status, download_token: paid.download_token });
  } catch {
    return NextResponse.json({ error: "test mode is off" }, { status: 403 });
  }
}
