import "server-only";

// QPay merchant API v2 client.
// Endpoints follow QPay's published v2 docs as best understood; verify against the
// documentation QPay gives you with your merchant account before going live.

const base = () => process.env.QPAY_BASE_URL || "https://merchant.qpay.mn/v2";

let cached: { token: string; expires: number } | null = null;

export function qpayEnabled(): boolean {
  return Boolean(process.env.QPAY_USERNAME && process.env.QPAY_PASSWORD && process.env.QPAY_INVOICE_CODE);
}

async function token(): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const auth = Buffer.from(`${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`).toString("base64");
  const res = await fetch(`${base()}/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`QPay auth failed: ${res.status}`);
  const body = (await res.json()) as { access_token: string; expires_in: number };
  // expires_in may be seconds-from-now or an epoch; treat large values as epoch seconds.
  const exp = body.expires_in > 1e9 ? body.expires_in * 1000 : Date.now() + body.expires_in * 1000;
  cached = { token: body.access_token, expires: exp };
  return body.access_token;
}

async function call<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`QPay ${path} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type QpayInvoice = {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  qPay_shortUrl?: string;
  urls: { name: string; description?: string; logo?: string; link: string }[];
};

export function createInvoice(opts: { orderId: string; amount: number; description: string }) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return call<QpayInvoice>("/invoice", {
    invoice_code: process.env.QPAY_INVOICE_CODE,
    sender_invoice_no: opts.orderId,
    invoice_receiver_code: "terminal",
    invoice_description: opts.description.slice(0, 255),
    amount: opts.amount,
    callback_url: `${site}/api/qpay/callback?order=${opts.orderId}`,
  });
}

/** Returns the total amount paid on an invoice, according to QPay. */
export async function paidAmount(invoiceId: string): Promise<number> {
  const body = await call<{ count: number; paid_amount?: number; rows?: { payment_status: string; payment_amount: string | number }[] }>(
    "/payment/check",
    { object_type: "INVOICE", object_id: invoiceId, offset: { page_number: 1, page_limit: 100 } },
  );
  if (typeof body.paid_amount === "number") return body.paid_amount;
  return (body.rows ?? [])
    .filter((r) => r.payment_status === "PAID")
    .reduce((s, r) => s + Number(r.payment_amount), 0);
}
