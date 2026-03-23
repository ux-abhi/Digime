# DigiMe

AI-powered portfolio chatbot SaaS. Turn your portfolio into a 24/7 AI sales rep.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Groq API (multi-model rotation)
- **Payments**: Stripe (coming soon)
- **Hosting**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in your keys
cp .env.local.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `GROQ_API_KEY` | Groq API key for AI inference |
| `NEXT_PUBLIC_APP_URL` | App URL (http://localhost:3000 for dev) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Core chat endpoint (widget calls this)
│   │   ├── chatbot/route.ts       # Public chatbot config endpoint
│   │   └── auth/callback/route.ts # OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx               # Overview with stats + embed code
│   │   ├── knowledge/page.tsx     # Knowledge table editor
│   │   ├── analytics/page.tsx     # Conversations + leads
│   │   └── settings/page.tsx      # Chatbot config
│   ├── login/page.tsx             # Auth (email magic link + Google)
│   └── page.tsx                   # Landing page
├── components/
│   └── dashboard/
│       ├── shell.tsx              # Sidebar layout
│       ├── overview.tsx           # Dashboard overview
│       └── knowledge-editor.tsx   # Knowledge CRUD
├── lib/
│   ├── types.ts                   # Database types + plan limits
│   ├── prompt.ts                  # Three-layer prompt assembler
│   ├── groq.ts                    # Groq client with model rotation
│   └── supabase/
│       ├── client.ts              # Browser client
│       ├── server.ts              # Server client + admin client
│       └── middleware.ts          # Auth session refresh
└── middleware.ts                   # Route protection
```

## Database

Supabase project: `uveeyyufidoayqmkdqiv` (us-east-1)

Tables: profiles, chatbots, knowledge_entries, conversations, leads, bookings, analytics_events, api_keys

All tables have RLS enabled. Migrations tracked in Supabase dashboard.

## Architecture

```
Framer Plugin ──→ digime.app API ←── Chat Widget (widget.js)
                       │
                  Supabase DB
                       │
                  Groq AI Layer
```
