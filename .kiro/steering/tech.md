# Tech Stack

## Core Technologies

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Edge Functions)
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
