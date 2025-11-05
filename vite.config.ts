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
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // React Router
          if (id.includes('node_modules/react-router-dom')) {
            return 'router-vendor';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          // Tanstack Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query-vendor';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }
          // Sentry
          if (id.includes('node_modules/@sentry')) {
            return 'sentry-vendor';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          // Other large libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },
}));
