import { notFound } from "next/navigation";
import { db, type Product } from "@/lib/db";
import { formatMnt, pick, t } from "@/lib/i18n";
import { getOrder, refreshOrder } from "@/lib/orders";
import OrderStatus from "./status";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, d } = await t();
  let order = await getOrder(id);
  if (!order) notFound();
  order = await refreshOrder(order).catch(() => order!);
  const { data } = await db().from("products").select("*").eq("id", order.product_id).single();
  const product = data as Product;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div className="panel">
        <h1 style={{ fontSize: "1.3rem" }}>{pick(lang, product.title_mn, product.title_en)}</h1>
        <p className="price">{formatMnt(order.amount_mnt)}</p>
        <OrderStatus
          orderId={order.id}
          initialStatus={order.status}
          provider={order.provider}
          qrImage={order.qr_image}
          banks={order.payment_urls}
          downloadToken={order.status === "paid" ? order.download_token : null}
          isCourse={product.kind === "course"}
          labels={{
            payWith: d.payWith,
            waiting: d.waiting,
            paid: d.paid,
            download: d.download,
            keepLink: d.keepLink,
            simulate: d.simulate,
            testMode: d.testMode,
          }}
        />
      </div>
    </div>
  );
}
