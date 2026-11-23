import { notFound } from "next/navigation";
import { db, type Product } from "@/lib/db";
import { formatMnt, productText, t } from "@/lib/i18n";
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
    <div className="wrap page"><div className="order-wrap">
      <div className="panel">
        <h1 className={productText(lang, product).script ? "vt" : ""}>{productText(lang, product).title}</h1>
        <p className="price">{formatMnt(order.amount_mnt, lang)}</p>
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
    </div></div>
  );
}
