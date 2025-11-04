---
inclusion: always
---

# Tech Stack & Development Guidelines

## Stack Overview

- React 18 + TypeScript (relaxed mode: noImplicitAny: false, strictNullChecks: false)
- Vite 5 with path aliases (`@/` → `./src/`)
- React Router v6 for routing
- Supabase (PostgreSQL + Edge Functions) via Lovable Cloud
- TanStack Query for server state
- React Hook Form + Zod for forms/validation
- shadcn/ui (Radix UI) + Tailwind CSS
- Lucide React icons

## Code Style Rules

### TypeScript
- Use TypeScript but relaxed rules apply (implicit any allowed)
- Prefer type inference over explicit typing when obvious
- Use Zod schemas for runtime validation

### React Patterns
- Functional components only
- Custom hooks for reusable logic (prefix with `use`)
- TanStack Query for all server state (no manual fetch in components)
- React Hook Form for all forms
- Avoid prop drilling - use composition or context when needed

### Styling
- Tailwind utility classes only (no CSS modules or styled-components)
- Use design tokens from CSS variables (HSL format)
- Premium aesthetic: subtle glows, smooth transitions, depth effects
- Mobile-first responsive design

### Imports
- Always use `@/` alias for src imports
- Group imports: external → internal → types → styles

### State Management
- Server state: TanStack Query only
- Auth state: `useAuth` hook
- Local state: React hooks (useState, useReducer)
- NO Redux, Zustand, or other global state libraries

## Critical Rules

### shadcn/ui Components
- NEVER manually edit files in `src/components/ui/`
- These are auto-generated - regenerate via CLI if changes needed

### Routing
- Add custom routes ABOVE the catch-all `*` route in `App.tsx`
- Protected routes must be wrapped in `<AppLayout>`
- Auth routes (`/auth`, `/onboarding`) are standalone

### Supabase Integration
- Database changes: Run SQL in Supabase Dashboard SQL Editor
- Edge Functions: Deploy via `supabase functions deploy <name>`
- Secrets: Set via `supabase secrets set KEY=value`
- RLS policies required before production

## Common Commands

```bash
npm run dev          # Dev server (port 8080)
npm run build        # Production build
npm run lint         # ESLint check
supabase functions deploy <name>  # Deploy edge function
```

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
