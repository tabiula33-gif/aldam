import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { t } from "@/lib/i18n";
import { KeyBorder, Ulzii } from "./ornaments";
import Nav from "./nav";

const inter = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-inter", display: "swap" });
const lora = Lora({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  title: "Aldam",
  description: "Digital products from Mongolian creators",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, d } = await t();
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL;
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  return (
    <html lang={lang} className={`${inter.variable} ${lora.variable}`}>
      <body>
        <header className="site">
          <div className="wrap">
            <Link href="/" className="brand"><Ulzii size={26} /> Aldam</Link>
            <Suspense fallback={<div className="nav" />}><Nav labels={{ all: d.all, ...d.kind }} /></Suspense>
            <nav className="lang" aria-label="Language">
              <a href="/api/lang?to=mn" className={lang === "mn" ? "on" : ""}>МН</a>
              <a href="/api/lang?to=en" className={lang === "en" ? "on" : ""}>EN</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site">
          <KeyBorder />
          <div className="wrap">
            <div>
              <Link href="/" className="brand"><Ulzii size={24} /> Aldam</Link>
              <p>{d.footerText}</p>
            </div>
            {(email || facebook || instagram) && (
              <div>
                <h4>{d.contact}</h4>
                {email && <a href={`mailto:${email}`}>{email}</a>}
                {facebook && <a href={facebook}>Facebook</a>}
                {instagram && <a href={instagram}>Instagram</a>}
              </div>
            )}
            <div className="copy">© {new Date().getFullYear()} Aldam. {d.rights}</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
