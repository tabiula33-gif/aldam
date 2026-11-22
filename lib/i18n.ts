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
  },
} as const;

export type Dict = (typeof dict)["mn"];

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
