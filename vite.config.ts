import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-progress', '@radix-ui/react-select', '@radix-ui/react-slot', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'sentry-vendor': ['@sentry/react'],
          'icons-vendor': ['lucide-react'],
          'firebase-vendor': ['firebase/app', 'firebase/messaging'],
        },
      },
    },
    minify: 'esbuild',
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
  },
}));
