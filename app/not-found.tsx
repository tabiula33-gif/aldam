import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <h1>404</h1>
      <p><Link href="/">←</Link></p>
    </div>
  );
}
