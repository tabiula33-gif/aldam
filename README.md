# Aldam

An online shop for digital products (PDFs, planners, courses), built for Mongolia: QPay checkout, Mongolian and English, and secure download links after payment. It starts as a single shop and is set up so other sellers can be added later.

Built with Next.js and Supabase. Intended host: Vercel.

## What works in version 1

- Product catalog and product pages, in Mongolian and English (switch at the top right)
- Checkout: buyer enters an email, gets a QPay QR code and bank app links, and the page updates by itself when payment arrives
- Payment is confirmed by asking QPay directly, never by trusting the browser
- After payment: a download button that gives a link valid for 60 seconds, up to 20 downloads per order
- Admin page at `/admin`: add products with cover image and file, hide or show them, see recent sales
- Test mode: with no QPay keys set, a "simulate payment" button replaces the QR code (development only)

Not in version 1 yet: emailing the download link, card payments outside QPay, course lesson pages, extra sellers.

## Setup

1. **Supabase.** Create a free project at supabase.com. Open the SQL editor and run `supabase/schema.sql`.
2. **Environment.** Copy `.env.example` to `.env.local` and fill in the Supabase URL and service role key (Project settings > API), plus `ADMIN_PASSWORD` and a long random `ADMIN_SECRET`.
3. **Run it.**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000/admin, log in, add a product, then buy it from the shop with the test button.
4. **QPay.** Once you have a merchant account, set `QPAY_USERNAME`, `QPAY_PASSWORD` and `QPAY_INVOICE_CODE`. The client in `lib/qpay.ts` follows QPay's v2 API; check it against the documentation QPay sends you, and test with their sandbox URL first.
5. **Deploy.** Import the repository on vercel.com, add the same environment variables, and set `NEXT_PUBLIC_SITE_URL` to your domain so QPay's payment callback reaches the site.
