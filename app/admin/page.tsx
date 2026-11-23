import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminCookie, isAdmin, passwordMatches, setAdminCookie } from "@/lib/admin";
import { db, type Order, type Product } from "@/lib/db";
import { formatMnt } from "@/lib/i18n";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  if (passwordMatches(String(formData.get("password") ?? ""))) {
    await setAdminCookie();
    redirect("/admin");
  }
  redirect("/admin?err=1");
}

async function logout() {
  "use server";
  await clearAdminCookie();
  redirect("/admin");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function upload(bucket: "covers" | "files", file: File | null, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const safe = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${prefix}/${Date.now()}-${safe}`;
  const { error } = await db().storage.from(bucket).upload(path, file, { contentType: file.type || undefined });
  if (error) throw error;
  return path;
}

async function addProduct(formData: FormData) {
  "use server";
  if (!(await isAdmin())) redirect("/admin");
  const title_mn = String(formData.get("title_mn") ?? "").trim();
  const price = Number(formData.get("price_mnt"));
  if (!title_mn || !Number.isInteger(price) || price <= 0) redirect("/admin?err=form");

  const { data: seller } = await db().from("sellers").select("id").order("created_at").limit(1).single();
  const slugBase = slugify(String(formData.get("title_en") || title_mn)) || "product";
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

  const cover_path = await upload("covers", formData.get("cover") as File | null, slug);
  const file_path = await upload("files", formData.get("file") as File | null, slug);

  const compare = Number(formData.get("compare_at_mnt"));
  const { error } = await db().from("products").insert({
    seller_id: seller!.id,
    slug,
    kind: String(formData.get("kind")),
    title_mn,
    title_en: String(formData.get("title_en") ?? "").trim(),
    description_mn: String(formData.get("description_mn") ?? ""),
    description_en: String(formData.get("description_en") ?? ""),
    price_mnt: price,
    // Only sent when filled in, so older databases without the column still work.
    ...(Number.isInteger(compare) && compare > price ? { compare_at_mnt: compare } : {}),
    cover_path,
    file_path,
    active: true,
  });
  if (error) throw error;
  revalidatePath("/");
  redirect("/admin?ok=1");
}

async function toggleActive(formData: FormData) {
  "use server";
  if (!(await isAdmin())) redirect("/admin");
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await db().from("products").update({ active: !active }).eq("id", id);
  revalidatePath("/admin");
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ err?: string; ok?: string }> }) {
  const { err, ok } = await searchParams;

  if (!(await isAdmin())) {
    return (
      <div className="wrap page">
      <form action={login} className="panel" style={{ maxWidth: 360, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.3rem" }}>Admin</h1>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        {err && <p className="error">Wrong password</p>}
        <button className="btn full">Log in</button>
      </form>
      </div>
    );
  }

  const [{ data: products }, { data: orders }] = await Promise.all([
    db().from("products").select("*").order("created_at", { ascending: false }),
    db().from("orders").select("*").eq("status", "paid").order("paid_at", { ascending: false }).limit(50),
  ]);
  const titles = new Map((products as Product[]).map((p) => [p.id, p.title_mn]));
  const revenue = (orders as Order[]).reduce((s, o) => s + o.amount_mnt, 0);

  return (
    <div className="wrap page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin</h1>
        <form action={logout}><button className="btn ghost">Log out</button></form>
      </div>

      <h2>Add a product</h2>
      {ok && <p className="ok">Product added.</p>}
      {err === "form" && <p className="error">Mongolian title and a whole-number price are required.</p>}
      <form action={addProduct} className="panel">
        <div className="row two">
          <div><label>Title (Mongolian) *</label><input name="title_mn" required /></div>
          <div><label>Title (English)</label><input name="title_en" /></div>
        </div>
        <div className="row two">
          <div><label>Description (Mongolian)</label><textarea name="description_mn" /></div>
          <div><label>Description (English)</label><textarea name="description_en" /></div>
        </div>
        <div className="row two">
          <div>
            <label>Type</label>
            <select name="kind" defaultValue="pdf">
              <option value="pdf">PDF</option>
              <option value="planner">Planner</option>
              <option value="course">Course</option>
            </select>
          </div>
          <div><label>Price (₮) *</label><input name="price_mnt" type="number" min="1" step="1" required /></div>
        </div>
        <div className="row two">
          <div>
            <label>Old price (₮), optional</label>
            <input name="compare_at_mnt" type="number" min="1" step="1" />
            <p className="hint">Fill in to show a sale, e.g. old price crossed out and “−30%”.</p>
          </div>
          <div />
        </div>
        <div className="row two">
          <div><label>Cover image</label><input name="cover" type="file" accept="image/*" /></div>
          <div><label>File buyers download</label><input name="file" type="file" /></div>
        </div>
        <button className="btn full">Add product</button>
      </form>

      <h2 style={{ marginTop: 40 }}>Products</h2>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Title</th><th>Type</th><th>Price</th><th>File</th><th></th></tr></thead>
          <tbody>
            {(products as Product[]).map((p) => (
              <tr key={p.id}>
                <td><a href={`/p/${p.slug}`}>{p.title_mn}</a></td>
                <td>{p.kind}</td>
                <td>{formatMnt(p.price_mnt)}</td>
                <td>{p.file_path ? "✓" : "missing"}</td>
                <td>
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={String(p.active)} />
                    <button className="btn ghost">{p.active ? "Hide" : "Show"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: 40 }}>Recent sales · {formatMnt(revenue)}</h2>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Date</th><th>Product</th><th>Email</th><th>Amount</th></tr></thead>
          <tbody>
            {(orders as Order[]).map((o) => (
              <tr key={o.id}>
                <td>{o.paid_at?.slice(0, 10)}</td>
                <td>{titles.get(o.product_id)}</td>
                <td>{o.email}</td>
                <td>{formatMnt(o.amount_mnt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
