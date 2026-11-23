import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Montserrat, Manrope } from "next/font/google";
import "./globals.css";
import { t } from "@/lib/i18n";
import { KeyBorder, Ulzii } from "./ornaments";
import CategoryChips from "./components/CategoryChips";
import { IconSearch } from "./components/icons";

const heading = Montserrat({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-heading", display: "swap" });
const body = Manrope({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-body", display: "swap" });

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
    <html lang={lang} className={`${heading.variable} ${body.variable}`}>
      <body>
        <header className="site">
          <div className="wrap bar">
            <Link href="/" className="brand"><Ulzii size={26} /> Aldam</Link>
            <form action="/shop" className="search" role="search">
              <IconSearch size={17} />
              <input name="q" type="search" placeholder={d.search} aria-label={d.search} />
            </form>
            <nav className="lang" aria-label="Language">
              <a href="/api/lang?to=mn" className={lang === "mn" ? "on" : ""}>МН</a>
              <a href="/api/lang?to=en" className={lang === "en" ? "on" : ""}>EN</a>
            </nav>
          </div>
          <div className="wrap">
            <Suspense fallback={<div className="chips" />}>
              <CategoryChips labels={{ all: d.any, ...d.kind }} />
            </Suspense>
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
            <div>
              <h4>{d.shop}</h4>
              <Link href="/shop?kind=pdf">{d.kind.pdf}</Link>
              <Link href="/shop?kind=planner">{d.kind.planner}</Link>
              <Link href="/shop?kind=course">{d.kind.course}</Link>
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
