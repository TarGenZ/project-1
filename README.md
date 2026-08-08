# ArpanMentors — NEET UG Mentorship Platform

A full-stack NEET UG mentorship booking platform with Razorpay payments, Supabase auth/database, and Zoom sessions.

## Stack

- **Frontend**: React + Vite + Framer Motion
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database + Auth**: Supabase (Google OAuth)
- **Payments**: Razorpay Standard Checkout
- **Sessions**: Zoom
- **Deploy**: Vercel

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd neet-mentorship
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Authentication → Providers** and enable **Google**
4. Add your OAuth redirect URL: `https://your-domain.com/dashboard`
5. Copy your **Project URL** and **anon key** from Project Settings → API

### 3. Environment variables

Create `.env` (already gitignored):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_RAZORPAY_KEY_ID=rzp_test_T6FCzuCkCgC8xV
RAZORPAY_KEY_ID=rzp_test_T6FCzuCkCgC8xV
RAZORPAY_KEY_SECRET=7yO5ZJyceWgE6Bov2ugQqJ2r
```

### 4. Update WhatsApp number

In `src/components/sections/CTA.jsx` and `src/pages/Dashboard.jsx`, replace:
```js
const WHATSAPP_NUMBER = '919999999999';
```
with your actual number (91 + 10-digit mobile, no spaces/dashes).

### 5. Local development

```bash
npx vercel dev
```
This runs both Vite (port 5173) and the API routes (port 3000) together.

### 6. Deploy to Vercel

```bash
# Push to GitHub, then import in Vercel dashboard
# Add all env vars in Vercel → Project → Settings → Environment Variables
```

---

## Architecture

```
/
├── api/
│   ├── create-order.js      # POST /api/create-order (Razorpay)
│   └── verify-payment.js    # POST /api/verify-payment (HMAC verify)
├── src/
│   ├── components/
│   │   ├── sections/        # Hero, About, Process, Pricing, FAQ, CTA
│   │   └── ui/              # Navbar, Footer, ProtectedRoute
│   ├── context/AuthContext.jsx
│   ├── hooks/
│   │   ├── usePayment.js    # Razorpay checkout hook
│   │   └── useSpots.js      # Live spots counter via Supabase realtime
│   ├── lib/supabase.js
│   └── pages/
│       ├── Home.jsx
│       └── Dashboard.jsx
└── supabase-schema.sql
```

## Plans

| Plan | Price | Sessions |
|------|-------|----------|
| Group (per session) | ₹199 | 1 hr group Zoom |
| Group (yearly) | ₹10,348 | 52 sessions (1/week) |
| Personal (per session) | ₹1,000 | 1 hr 1-on-1 Zoom |
| Personal (yearly) | ₹52,000 | 52 sessions (1/week) |

- **Personal spots**: 14 total
- **Group spots**: 1 batch
