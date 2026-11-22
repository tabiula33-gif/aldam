import { NextResponse } from "next/server";
import { getOrder, refreshOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

// QPay calls this URL after a payment. We don't trust the request itself:
// we look up the order and ask QPay directly whether it is paid.
async function handle(req: Request) {
  const id = new URL(req.url).searchParams.get("order") ?? "";
  const order = await getOrder(id);
  if (order) await refreshOrder(order).catch((e) => console.error("qpay callback", e));
  return NextResponse.json({ ok: true });
}

export const GET = handle;
export const POST = handle;
