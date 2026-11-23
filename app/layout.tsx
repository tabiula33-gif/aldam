import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Montserrat, Manrope, Noto_Sans_Mongolian } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { scriptEnabled, t } from "@/lib/i18n";
import { KeyBorder, Ulzii } from "./ornaments";
import CategoryChips from "./components/CategoryChips";
import SideNav from "./components/SideNav";
import { IconSearch } from "./components/icons";

const heading = Montserrat({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-heading", display: "swap" });
const body = Manrope({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-body", display: "swap" });
const mongol = Noto_Sans_Mongolian({ subsets: ["mongolian"], weight: "400", variable: "--font-mong", display: "swap" });
// Classical Mongolian Dashitseden by Bolorsoft (free for personal and commercial use), see app/fonts/README.md
const mongolText = localFont({ src: "./fonts/Dashitseden.woff2", variable: "--font-mong-text", display: "swap" });

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
    <html lang={lang === "mong" ? "mn-Mong" : lang} className={`${heading.variable} ${body.variable} ${mongol.variable} ${mongolText.variable}${lang === "mong" ? " mong" : ""}`}>
      <body>
        {lang === "mong" ? (
          <aside className="rail">
            <Link href="/" className="rail-brand" aria-label="Aldam"><Ulzii size={30} /><span>Aldam</span></Link>
            <Suspense fallback={<nav className="snav" />}>
              <SideNav labels={{ home: d.home, all: d.any, ...d.kind, search: d.search }} />
            </Suspense>
            <nav className="lang rail-lang" aria-label="Language">
              <a href="/api/lang?to=mn">МН</a>
              <a href="/api/lang?to=mong" className="script on" title="Монгол бичиг">ᠮᠣᠩ</a>
              <a href="/api/lang?to=en">EN</a>
            </nav>
          </aside>
        ) : (
        <header className="site">
          <div className="wrap bar">
            <Link href="/" className="brand"><Ulzii size={26} /> Aldam</Link>
            <form action="/shop" className="search" role="search">
              <IconSearch size={17} />
              <input name="q" type="search" placeholder={d.search} aria-label={d.search} />
            </form>
            <nav className="lang" aria-label="Language">
              <a href="/api/lang?to=mn" className={lang === "mn" ? "on" : ""}>МН</a>
              {scriptEnabled() && <a href="/api/lang?to=mong" className="script" title="Монгол бичиг">ᠮᠣᠩ</a>}
              <a href="/api/lang?to=en" className={lang === "en" ? "on" : ""}>EN</a>
            </nav>
          </div>
          <div className="wrap">
            <Suspense fallback={<div className="chips" />}>
              <CategoryChips labels={{ all: d.any, ...d.kind }} />
            </Suspense>
          </div>
        </header>
        )}
        <div className="shell">
        <main>{children}</main>
        <footer className="site">
          <KeyBorder />
          <div className="wrap">
            <div>
              <Link href="/" className="brand"><Ulzii size={24} /> Aldam</Link>
              <p className="vt">{d.footerText}</p>
            </div>
            <div>
              <h4 className="vt">{d.shop}</h4>
              <Link href="/shop?kind=pdf" className="vt">{d.kind.pdf}</Link>
              <Link href="/shop?kind=planner" className="vt">{d.kind.planner}</Link>
              <Link href="/shop?kind=course" className="vt">{d.kind.course}</Link>
            </div>
            {(email || facebook || instagram) && (
              <div>
                <h4 className="vt">{d.contact}</h4>
                {email && <a href={`mailto:${email}`}>{email}</a>}
                {facebook && <a href={facebook}>Facebook</a>}
                {instagram && <a href={instagram}>Instagram</a>}
              </div>
            )}
            <div className="copy">© {new Date().getFullYear()} Aldam. <span className="vt">{d.rights}</span></div>
          </div>
        </footer>
        </div>
      </body>
    </html>
  );
}
