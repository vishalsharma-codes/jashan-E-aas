# Jashan-E-Aas — India's Premier Event Marketplace

A premium cinematic event marketplace — rebuilt as a standalone Vite + React app, fully decoupled from Replit.

## Stack

- **React 19** + **TypeScript 5**
- **Vite 6** (bundler)
- **Tailwind CSS v4** (dark cinematic theme)
- **Framer Motion** (animations)
- **React Router v6** (routing)
- **TanStack React Query** (data layer)
- **shadcn/ui** style Radix-based component library
- **Supabase** (auth — optional, works without config)

---

## Routes

| Path | Page |
|---|---|
| `/` | Homepage |
| `/auth` | Sign in / Sign up |
| `/vendors` | Vendor discovery + search + filters |
| `/for-partners` | Partner onboarding |
| `/category/:categoryId` | Category page |
| `/vendor-dashboard` | Vendor dashboard |
| `/how-it-works` | How It Works |
| `/ultra-gold` | Ultra Gold membership |
| `/community` | Community |
| `/account` | Customer account |
| `/booking-system` | Booking wizard + payment |
| `/rewards` | Gamification / rewards |
| `/compare` | Vendor comparison |
| `/trust-safety` | Trust & Safety |

---

## Quick Start

### Prerequisites
- **Node.js 18+** (Node 20 recommended)
- **npm** (comes with Node)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase (optional)

Edit `.env` and fill in your Supabase project URL and anon key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Without these, the app still runs — just auth features (sign in / sign up) won't work.

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`. You can deploy this folder to Vercel, Netlify, or any static host.

### 5. Preview production build locally

```bash
npm run preview
```

---

## Deploy to Vercel (recommended)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import that repo
3. Framework: **Vite** (auto-detected)
4. Add environment variables in Vercel dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy

> **Note:** Since the app uses React Router `BrowserRouter`, add a `vercel.json` in the root to handle client-side routing:
> ```json
> { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
> ```

---

## Deploy to Netlify

1. Build: `npm run build`
2. Deploy the `dist/` folder
3. Add a `_redirects` file inside `public/`:
   ```
   /* /index.html 200
   ```

---

## Project Structure

```
src/
├── App.tsx                    # Router + providers
├── main.tsx                   # Entry point
├── index.css                  # Tailwind v4 + brand theme tokens
├── pages/
│   ├── Index.tsx              # Homepage
│   ├── Vendors.tsx            # Vendor discovery (search, filters)
│   ├── BookingSystem.tsx      # Full booking wizard
│   ├── Auth.tsx               # Auth page
│   └── ...12 more pages
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── EveBuddy.tsx           # AI assistant bottom nav
│   ├── EveBuddyChat.tsx       # Chat panel
│   ├── EveBuddyAgentMode.tsx  # Agent mode panel
│   ├── EveBuddyAvatar.tsx     # Avatar panel
│   ├── CategoryMindmap.tsx    # Full-screen category explorer
│   ├── UpiPayment.tsx         # UPI payment modal
│   └── ui/                    # shadcn-style UI primitives
├── lib/
│   ├── vendorData.ts          # All mock vendor data + filter helpers
│   └── categoryData.ts        # Category tree data
├── hooks/
│   ├── useAuth.tsx            # Supabase auth context
│   └── use-toast.ts
└── integrations/
    └── supabase/client.ts     # Supabase client (safe fallback if no keys)
```
