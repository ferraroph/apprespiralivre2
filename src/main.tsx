import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import { validateEnvOrFail } from "./lib/validateEnv";

// Validate environment variables before starting the app
validateEnvOrFail();

// Initialize Sentry
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
  });
}

// Register Service Workers
if ('serviceWorker' in navigator) {
  // Register Firebase Messaging Service Worker
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Firebase Messaging Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Firebase Messaging Service Worker registration failed:', error);
    });

  // Register Asset Caching Service Worker
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('Asset Caching Service Worker registered:', registration);
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour
    })
    .catch((error) => {
      console.error('Asset Caching Service Worker registration failed:', error);
    });
}

createRoot(document.getElementById("root")!).render(<App />);
