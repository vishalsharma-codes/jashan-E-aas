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

# Baatein: customer ↔ vendor chat with voice & video calls

Adds a **Baatein** link to the navbar (visible when signed in, with a gold unread badge) and a
WhatsApp-style chat page at `/chat`. No new npm packages are needed.

## What you get
- Real-time 1-to-1 chat (Supabase Realtime): text, emoji, photos, files, voice notes
- Read ticks, typing indicator, online dot, unread badges, day separators
- **Voice call** and **video call** (WebRTC) with ringing, accept/decline, mute, camera off, timer
- Call history shows in the chat ("Video call · 3:21", "Missed voice call")
- Customer quick-reply chips ("Are you available on my event date?", "Request a quote")
- Mobile layout: list and conversation are two screens

## Setup (about 10 minutes)

1. **Database**: open Supabase → SQL Editor → paste and run `supabase/chat_schema.sql`.
   This creates the tables, security rules, realtime and the `chat-media` storage bucket.

2. **Copy files** into your project, keeping the same paths:
   ```
   src/lib/chatClient.ts        src/lib/chatTypes.ts      src/lib/chatApi.ts
   src/hooks/useChat.ts         src/hooks/useVoiceRecorder.ts
   src/components/chat/*        src/pages/Chat.tsx
   ```

3. **Point to your Supabase client**: open `src/lib/chatClient.ts` and fix the one import
   so it matches the client your `useAuth` already uses.

4. **Replace** `src/components/Navbar.tsx` and `src/App.tsx` with the versions provided.
   Changes are marked with `// NEW`. (`Chat.tsx` imports `Navbar` from `@/components/Navbar`;
   change that path if yours differs.)

5. **Add a "Message" button on vendor cards / profiles** (this is how chats start):
   ```tsx
   import { MessageVendorButton } from "@/components/chat/MessageVendorButton";

   <MessageVendorButton
     vendor={{ userId: vendor.user_id, name: vendor.business_name, avatar: vendor.logo_url, service: vendor.category }}
   />
   ```
   `userId` must be the vendor's **auth user id**. Vendors then see the same Baatein page and
   reply from there.

## Testing calls
Use two different browsers (or one normal and one incognito window), sign in as a customer and as
a vendor, start a chat from the customer, and press the phone or camera icon.
`localhost` is allowed to use camera and mic; a deployed site needs **https**.

## Before going live
- **TURN server**: calls use free Google STUN servers, which connect most users. Some mobile
  networks and strict firewalls need a TURN relay. Add one (e.g. Metered, Twilio, Cloudflare Calls
  or self-hosted coturn) via `.env`:
  ```
  VITE_TURN_URL=turn:your-turn-host:3478
  VITE_TURN_USERNAME=...
  VITE_TURN_CREDENTIAL=...
  ```
- **Incoming calls ring only while the site is open** in a browser tab. For ringing when the
  site is closed you'd need push notifications (a later add-on).
- Chat media bucket is public-read (files have unguessable paths). For stricter privacy switch
  to a private bucket with signed URLs.
- Labels are plain English; wire them into your language switcher if you want them translated.
