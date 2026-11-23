"use client";

import { useEffect, useState } from "react";

type Props = {
  orderId: string;
  initialStatus: string;
  provider: string;
  qrImage: string | null;
  banks: { name: string; description?: string; logo?: string; link: string }[];
  downloadToken: string | null;
  isCourse: boolean;
  labels: Record<"payWith" | "waiting" | "paid" | "download" | "keepLink" | "simulate" | "testMode", string>;
};

export default function OrderStatus(p: Props) {
  const [status, setStatus] = useState(p.initialStatus);
  const [token, setToken] = useState(p.downloadToken);

  useEffect(() => {
    if (status !== "pending") return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/orders/${p.orderId}`, { cache: "no-store" });
      if (!res.ok) return;
      const body = await res.json();
      if (body.status !== "pending") {
        setStatus(body.status);
        setToken(body.download_token ?? null);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [status, p.orderId]);

  async function simulate() {
    const res = await fetch(`/api/orders/${p.orderId}/simulate`, { method: "POST" });
    if (res.ok) {
      const body = await res.json();
      setStatus(body.status);
      setToken(body.download_token ?? null);
    }
  }

  if (status === "paid" && token) {
    return (
      <>
        <p className="ok">✓ <span className="vt">{p.labels.paid}</span></p>
        <a className="btn full" href={`/api/download/${token}`}><span className="vt">{p.labels.download}</span></a>
        <p className="notice"><span className="vt">{p.labels.keepLink}</span></p>
      </>
    );
  }

  return (
    <>
      {p.provider === "qpay" && p.qrImage && (
        <>
          <p><span className="vt">{p.labels.payWith}</span></p>
          <img className="qr" src={`data:image/png;base64,${p.qrImage}`} alt="QPay QR" />
          {p.banks.length > 0 && (
            <div className="banks">
              {p.banks.map((b) => (
                <a key={b.name} href={b.link}>
                  {b.logo && <img src={b.logo} alt="" />}
                  {b.description || b.name}
                </a>
              ))}
            </div>
          )}
        </>
      )}
      {p.provider === "test" && (
        <>
          <p className="notice"><span className="vt">{p.labels.testMode}</span></p>
          <button className="btn full" onClick={simulate}><span className="vt">{p.labels.simulate}</span></button>
        </>
      )}
      <p className="muted" style={{ marginTop: 16 }}><span className="spinner" /><span className="vt">{p.labels.waiting}</span></p>
    </>
  );
}
