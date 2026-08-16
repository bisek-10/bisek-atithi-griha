# Bisek Atithi Griha — website + management system

A public website plus a private management app for a 1lodge (long-stay
accommodation for families visiting B.P. Koirala Memorial Cancer Hospital,
Bharatpur).

**Stack — free forever, no subscription to Anthropic or anyone else:**
- **Frontend:** React + Vite + Tailwind CSS
- **Database/Auth/Storage:** [Supabase](https://supabase.com) free tier (Postgres database, login, and file storage for the QR image)
- **Hosting:** [Vercel](https://vercel.com) free tier
- **PDF bills:** generated entirely in the browser (jsPDF) — no server needed
- **Nepali (Bikram Sambat) dates:** `nepali-date-converter` — dates are stored as normal Gregorian timestamps in the database and only *displayed* in BS, so all date math stays simple and reliable

Total ongoing cost at this scale (14 rooms): **NPR 0 / month.**

---

## 1. Create your Supabase project (5 min)

1. Go to https://supabase.com → sign up (free) → **New project**.
2. Wait for it to finish provisioning.
3. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
   This creates all tables, security rules, and seeds your 14 rooms with
   placeholder rates (edit real rates later in Admin → Settings).
4. Open **Storage** → **New bucket** → name it exactly `public-assets` →
   toggle **Public bucket** ON → Create. This is where the payment QR image
   you upload in Settings will live.
5. Open **Authentication → Users → Add user** and create a login (email +
   password) for yourself / your staff. This is how you'll sign in to
   `/admin`.
6. Open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

---

## 2. Run it locally (optional, to preview before deploying)

```bash
npm install
cp .env.example .env
# paste your Project URL and anon key into .env
npm run dev
```

Visit the printed local URL. Public site is at `/`, management app at `/admin`.

---

## 3. Deploy for free (Vercel)

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com → **Add New → Project** → import the repo.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Vercel gives you a free `https://your-project.vercel.app` URL
   (you can attach your own domain later, still free on Vercel's side —
   you'd only pay if you buy a domain name from a registrar).

---

## How the system is organized

### Public website (`/`, `/rooms`, `/contact`)
Marketing pages for people finding the lodge — no login needed, no
sensitive data.

### Management app (`/admin`, login required)
- **Room overview** — the 14 rooms as a grid, green = available, red =
  occupied. Click a green room (or "+ New check-in") to check someone in;
  click a red room to manage that stay.
- Inside an occupied room you can:
  - See guest info and a **running bill total** updated live.
  - Log **headcount changes** (e.g. 3 people move in for a few days, then
    leave) — extra-person charges apply only to the days that actually had
    extra people.
  - Add **service charges** (gas, gas refill, utensils, appliance use, or a
    custom "Other" service) for **any date, including past dates or a date
    range** — for when something was used a few days ago and wasn't logged
    at the time.
  - **Move the guest to another room** (transfer is recorded; billing
    continues under the same stay).
  - **Check out**: pick the checkout time, review the full itemized bill,
    choose **Cash** or **QR** payment, and a PDF bill downloads
    automatically.
- **Sales dashboard** — revenue charts with date-range and payment-method
  filters (7 days / 30 days / this year / custom BS date range).
- **Customers** — every guest who has ever stayed, searchable by name,
  address, or contact number, with a place to note when they're expected
  to come back for their next visit (useful for cancer treatment cycles
  that repeat every few weeks).
- **Settings** — hotel name/address/phone, upload your existing
  eSewa/Khalti/bank QR image, edit room rates and bathroom type per room,
  and edit the add-on service price list.

### The 3:00 AM check-in rule
The hotel's "day" is defined as running 3:00 AM → 3:00 AM, not midnight to
midnight. If a guest arrives before 3:00 AM, the system automatically
treats that as also having used the previous calendar day, and charges
that extra day — you don't have to remember to add it manually. This logic
lives in one place: `src/lib/billing.js` (`hotelDateStr`), so if the
cutoff hour ever needs to change, it's a one-line edit.

### Room rates
Each room has a **base rate** (covering a "standard occupancy," e.g. 2
people) and an **extra-person rate** charged per additional person per
night. Edit these anytime in Settings — changes only apply going forward.

---

## Extending this later

- **SMS/WhatsApp reminders** for the "expected to return" dates in
  Customers could be added via a free-tier service later — not included
  here to keep the system dependency-free out of the box.
- **Multiple staff logins** — just add more users in Supabase
  Authentication; everyone with a login has full access (simple by
  design for a small, trusted team).
- If you outgrow Supabase's free tier (very unlikely at 14 rooms), it has
  a paid tier — but there's no obligation and nothing here locks you into
  ever paying for it.
