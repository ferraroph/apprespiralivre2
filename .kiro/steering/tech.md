# Tech Stack

## Core Technologies

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **Backend**: Lovable Cloud (Supabase - PostgreSQL + Edge Functions)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation

## UI & Styling

- **Component Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: tailwindcss-animate with custom keyframes
- **Icons**: Lucide React
- **Toasts**: Sonner + shadcn toast
- **Theme**: HSL-based color system with CSS variables

## Development Tools

- **Linter**: ESLint 9
- **TypeScript Config**: Relaxed rules (noImplicitAny: false, strictNullChecks: false)
- **Dev Tagger**: lovable-tagger for component tracking

## Common Commands

```bash
# Development server (port 8080)
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview

# Deploy Supabase functions
supabase functions deploy <function-name>
```

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Key Dependencies

- `@supabase/supabase-js`: Backend integration
- `@tanstack/react-query`: Server state management
- `react-hook-form`: Form handling
- `zod`: Schema validation
- `date-fns`: Date utilities
- `recharts`: Data visualization

## Lovable Cloud Integration

This project uses **Lovable Cloud**, which is Lovable's managed Supabase integration. Key points:

- **Database tables**: Created via Lovable chat prompts. Lovable generates SQL snippets that must be run in Supabase Dashboard SQL Editor.
- **Authentication**: Configured in Supabase Dashboard (Authentication → Providers). OAuth providers like Google require Client ID/Secret from provider's console.
- **Edge Functions**: Deployed via Supabase CLI (`supabase functions deploy <function-name>`). Secrets managed via `supabase secrets set KEY=value`.
- **File Storage**: Managed through Supabase Storage. Free tier: 50MB per file limit.
- **Security**: Row Level Security (RLS) policies must be configured in Supabase Dashboard before production.
