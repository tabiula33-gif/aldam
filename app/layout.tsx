import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getLang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Aldam",
  description: "Digital products from Mongolian creators",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>
        <header className="site">
          <div className="wrap">
            <Link href="/" className="brand">Aldam</Link>
            <nav className="lang">
              <a href="/api/lang?to=mn" className={lang === "mn" ? "on" : ""}>МН</a>
              <a href="/api/lang?to=en" className={lang === "en" ? "on" : ""}>EN</a>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
