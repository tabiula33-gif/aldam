import { cookies } from "next/headers";

export type Lang = "mn" | "en";

const dict = {
  mn: {
    tagline: "Монгол бүтээгчдийн дижитал бүтээгдэхүүн",
    all: "Бүх бүтээгдэхүүн",
    empty: "Одоогоор бүтээгдэхүүн алга.",
    kind: { pdf: "PDF", planner: "Төлөвлөгч", course: "Сургалт" },
    buy: "Худалдан авах",
    email: "Имэйл хаяг",
    emailHint: "Татах холбоосыг энэ хаягаар баталгаажуулна.",
    pay: "Төлбөр төлөх",
    payWith: "QPay эсвэл банкны аппаар уншуулна уу",
    waiting: "Төлбөрийг хүлээж байна…",
    paid: "Төлбөр амжилттай!",
    download: "Татах",
    keepLink: "Энэ хуудасны холбоосыг хадгалаарай. Дахин татахад хэрэгтэй.",
    simulate: "Туршилтын төлбөр хийх",
    testMode: "Туршилтын горим: жинхэнэ төлбөр авахгүй.",
    notFound: "Олдсонгүй",
    back: "Буцах",
    heroTitle: "Монгол бүтээгчдийн дижитал бүтээгдэхүүн",
    heroText: "PDF, төлөвлөгч, сургалтыг QPay-ээр төлөөд шууд татаж аваарай.",
    browse: "Бүтээгдэхүүн үзэх",
    perks: ["QPay-ээр төлнө", "Төлсний дараа шууд татна", "Монгол бүтээгчдийн бүтээл"],
    newest: "Шинэ бүтээгдэхүүн",
    whatYouGet: "Төлбөр төлсний дараа татах холбоос шууд гарна. Энэ хуудасны холбоосоор дахин татаж болно.",
    secure: "Төлбөр QPay-ээр баталгаажна",
    footerText: "Монголд бүтээгдсэн дижитал бүтээгдэхүүний дэлгүүр.",
    contact: "Холбоо барих",
    rights: "Бүх эрх хуулиар хамгаалагдсан.",
  },
  en: {
    tagline: "Digital products from Mongolian creators",
    all: "All products",
    empty: "No products yet.",
    kind: { pdf: "PDF", planner: "Planner", course: "Course" },
    buy: "Buy",
    email: "Email address",
    emailHint: "Used to confirm your download link.",
    pay: "Pay",
    payWith: "Scan with QPay or your bank app",
    waiting: "Waiting for payment…",
    paid: "Payment received!",
    download: "Download",
    keepLink: "Save this page's link. You'll need it to download again.",
    simulate: "Simulate payment",
    testMode: "Test mode: no real payment is taken.",
    notFound: "Not found",
    back: "Back",
    heroTitle: "Digital products from Mongolian creators",
    heroText: "PDFs, planners and courses. Pay with QPay and download instantly.",
    browse: "Browse products",
    perks: ["Pay with QPay", "Instant download after payment", "Made by Mongolian creators"],
    newest: "New products",
    whatYouGet: "Your download link appears right after payment. You can download again from the same page.",
    secure: "Payment confirmed through QPay",
    footerText: "A shop for digital products made in Mongolia.",
    contact: "Contact",
    rights: "All rights reserved.",
  },
} as const;

type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly Widen<U>[] : { [K in keyof T]: Widen<T[K]> };
export type Dict = Widen<(typeof dict)["mn"]>;

export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get("lang")?.value;
  return c === "en" ? "en" : "mn";
}

export async function t(): Promise<{ lang: Lang; d: Dict }> {
  const lang = await getLang();
  return { lang, d: dict[lang] as Dict };
}

export function formatMnt(n: number): string {
  return new Intl.NumberFormat("en-US").format(n) + "₮";
}

export function pick(lang: Lang, mn: string, en: string): string {
  return lang === "en" && en ? en : mn;
}
