# dujo

a digital bullet journal! 

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setup (Supabase sync)

1. Copy `.env.example` to `.env.local`
2. Add your [Supabase](https://supabase.com) URL and anon key
3. Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor

## Tech

- Next.js (App Router), React, TypeScript, Tailwind CSS
- dnd-kit for drag and drop
- Supabase for auth and sync
