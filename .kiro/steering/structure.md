---
inclusion: always
---

# Project Structure & Organization

## Directory Layout

```
src/
├── main.tsx              # App entry point
├── App.tsx               # Root component with routing
├── index.css             # Global styles + CSS variables
├── pages/                # Route components (one per page)
├── components/
│   ├── ui/               # shadcn/ui (auto-generated, DO NOT EDIT)
│   ├── layout/           # Layout wrappers (AppLayout, etc.)
│   └── [features]        # Feature-specific components
├── hooks/                # Custom React hooks (use* prefix)
├── integrations/
│   └── supabase/         # Auto-generated Supabase client
└── lib/                  # Shared utilities

supabase/
├── config.toml           # Supabase configuration
├── functions/            # Edge functions (serverless)
└── migrations/           # Database schema SQL
```

## File Placement Rules

### When to create a new file in `src/pages/`
- One page component per route
- Named after the route (e.g., `Dashboard.tsx` for `/dashboard`)
- Existing pages: Auth, Onboarding, Dashboard, Leagues, Content, Community, Profile, NotFound

### When to create a new file in `src/components/`
- Reusable UI: `src/components/ui/` (via shadcn CLI only)
- Layout wrappers: `src/components/layout/`
- Feature components: `src/components/` (e.g., `CheckinDialog.tsx`)

### When to create a new file in `src/hooks/`
- Reusable stateful logic
- Must start with `use` prefix
- Existing hooks: useAuth, useProgress, use-mobile, use-toast

### When to create a new file in `src/lib/`
- Pure utility functions
- Shared helpers without React dependencies

## Architecture Patterns

### Component Composition
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use composition over prop drilling

### Data Flow
- Server data: TanStack Query hooks in components
- Auth state: `useAuth` hook
- Form state: React Hook Form
- Local UI state: useState/useReducer

### Routing Structure
```typescript
// App.tsx route order (CRITICAL):
<Routes>
  <Route path="/auth" element={<Auth />} />
  <Route path="/onboarding" element={<Onboarding />} />
  <Route element={<AppLayout />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/leagues" element={<Leagues />} />
    {/* Add new protected routes here */}
  </Route>
  <Route path="*" element={<NotFound />} /> {/* MUST BE LAST */}
</Routes>
```

### Import Conventions
```typescript
// Always use @/ alias for src imports
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
```

## Key Files

- `vite.config.ts`: Path aliases configuration
- `tailwind.config.ts`: Design tokens and animations
- `components.json`: shadcn/ui settings
- `App.tsx`: Routing and providers setup
