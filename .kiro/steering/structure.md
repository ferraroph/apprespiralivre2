# Project Structure

## Root Configuration

- `vite.config.ts`: Vite configuration with path aliases (`@/` → `./src/`)
- `tailwind.config.ts`: Design system tokens and custom animations
- `tsconfig.json`: TypeScript configuration (relaxed mode)
- `components.json`: shadcn/ui configuration

## Source Directory (`src/`)

### Entry Points
- `main.tsx`: Application entry point
- `App.tsx`: Root component with routing and providers
- `index.css`: Global styles and CSS variables

### Pages (`src/pages/`)
Page components for each route:
- `Auth.tsx`: Authentication page
- `Onboarding.tsx`: User onboarding flow
- `Dashboard.tsx`: Main dashboard (default route)
- `Leagues.tsx`: Leaderboards and competitions
- `Content.tsx`: Meditation and breathing exercises
- `Community.tsx`: Social features
- `Profile.tsx`: User profile
- `NotFound.tsx`: 404 page

### Components (`src/components/`)
- `ui/`: shadcn/ui components (auto-generated, do not edit manually)
- `layout/`: Layout components (e.g., `AppLayout.tsx`)
- Feature components (e.g., `CheckinDialog.tsx`)

### Hooks (`src/hooks/`)
Custom React hooks:
- `useAuth.tsx`: Authentication state and methods
- `useProgress.tsx`: User progress data
- `use-mobile.tsx`: Mobile detection
- `use-toast.ts`: Toast notifications

### Integrations (`src/integrations/`)
- `supabase/`: Auto-generated Supabase client and types

### Utilities (`src/lib/`)
Shared utility functions and helpers

## Backend (`supabase/`)

- `config.toml`: Supabase project configuration
- `functions/`: Edge functions (serverless)
- `migrations/`: Database schema migrations

## Conventions

### Routing
- All custom routes must be added ABOVE the catch-all `*` route in `App.tsx`
- Protected routes wrapped in `<AppLayout>` component
- Auth routes (`/auth`, `/onboarding`) standalone

### Component Organization
- Page components in `src/pages/`
- Reusable UI components in `src/components/ui/`
- Feature-specific components in `src/components/`
- Layout components in `src/components/layout/`

### Import Aliases
Use `@/` for all imports from `src/`:
```typescript
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
```

### Styling
- Use Tailwind utility classes
- Custom animations defined in `tailwind.config.ts`
- Design tokens via CSS variables (HSL format)
- Premium aesthetic: subtle glows, smooth transitions, depth

### State Management
- Server state: TanStack Query
- Auth state: Custom `useAuth` hook
- Local state: React hooks
- No global state library (Redux, Zustand, etc.)
