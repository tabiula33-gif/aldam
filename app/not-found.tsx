import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page" style={{ textAlign: "center", padding: "48px 16px" }}>
      <h1>404</h1>
      <p><Link href="/">←</Link></p>
    </div>
  );
}
