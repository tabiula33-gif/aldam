import "server-only";
import { db, type Order, type Product } from "./db";
import { createInvoice, paidAmount, qpayEnabled } from "./qpay";

/** Test payments are allowed only in development, or when explicitly turned on. */
function testModeAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_TEST_PAYMENTS === "true";
}

export async function createOrder(product: Product, email: string): Promise<Order> {
  const provider = qpayEnabled() ? "qpay" : "test";
  if (provider === "test" && !testModeAllowed()) {
    throw new Error("Payments are not configured. Set the QPAY_* environment variables.");
  }
  const { data, error } = await db()
    .from("orders")
    .insert({ product_id: product.id, email, amount_mnt: product.price_mnt, provider })
    .select("*")
    .single();
  if (error) throw error;
  const order = data as Order;
  if (provider === "test") return order;

  const inv = await createInvoice({ orderId: order.id, amount: product.price_mnt, description: product.title_mn });
  const { data: updated, error: e2 } = await db()
    .from("orders")
    .update({ provider_invoice_id: inv.invoice_id, qr_image: inv.qr_image, payment_urls: inv.urls ?? [] })
    .eq("id", order.id)
    .select("*")
    .single();
  if (e2) throw e2;
  return updated as Order;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

async function markPaid(order: Order): Promise<Order> {
  const { data, error } = await db()
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as Order) ?? { ...order, status: "paid" };
}

/** Asks QPay whether a pending order is paid, and records it if so. Never trusts the caller. */
export async function refreshOrder(order: Order): Promise<Order> {
  if (order.status !== "pending" || order.provider !== "qpay" || !order.provider_invoice_id) return order;
  const paid = await paidAmount(order.provider_invoice_id);
  if (paid >= order.amount_mnt) return markPaid(order);
  return order;
}

/** Test mode only: pretend the order was paid. */
export async function simulatePayment(order: Order): Promise<Order> {
  if (order.provider !== "test" || qpayEnabled() || !testModeAllowed()) throw new Error("Not a test order");
  return markPaid(order);
}
