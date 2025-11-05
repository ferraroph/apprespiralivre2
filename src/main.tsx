import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import { validateEnvOrFail } from "./lib/validateEnv";

console.log('[MAIN] Inicializando aplicação Respira Livre');
console.log('[MAIN] Environment:', import.meta.env.MODE);

// Validate environment variables before starting the app
console.log('[MAIN] Validando variáveis de ambiente');
try {
  validateEnvOrFail();
  console.log('[MAIN] Variáveis de ambiente validadas com sucesso');
} catch (error) {
  console.error('[MAIN] Erro na validação de variáveis de ambiente:', error);
}

// Initialize Sentry
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
console.log('[MAIN] Configurando Sentry:', { hasDsn: !!sentryDsn });
if (sentryDsn) {
  console.log('[MAIN] Inicializando Sentry');
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
  console.log('[MAIN] Sentry inicializado com sucesso');
} else {
  console.warn('[MAIN] Sentry DSN não encontrado - Sentry não será inicializado');
}

// Initialize dark mode from localStorage
console.log('[MAIN] Configurando tema');
const savedTheme = localStorage.getItem('theme');
console.log('[MAIN] Tema salvo:', savedTheme);
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
console.log('[MAIN] Sistema prefere dark mode:', prefersDark);

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  document.documentElement.classList.add('dark');
  console.log('[MAIN] Dark mode aplicado');
} else {
  console.log('[MAIN] Light mode aplicado');
}

// Register Service Workers
console.log('[MAIN] Verificando suporte a Service Workers');
if ('serviceWorker' in navigator) {
  console.log('[MAIN] Service Workers suportados');
  console.log('[MAIN] Registrando Firebase Messaging Service Worker');
  // Register Firebase Messaging Service Worker
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('[MAIN] Firebase Messaging Service Worker registrado:', registration);
    })
    .catch((error) => {
      console.error('[MAIN] Falha no registro do Firebase Messaging Service Worker:', error);
    });

  console.log('[MAIN] Registrando Asset Caching Service Worker');
  // Register Asset Caching Service Worker
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('[MAIN] Asset Caching Service Worker registrado:', registration);
      
      // Check for updates periodically
      console.log('[MAIN] Configurando verificação periódica de atualizações');
      setInterval(() => {
        console.log('[MAIN] Verificando atualizações do Service Worker');
        registration.update();
      }, 60 * 60 * 1000); // Check every hour
    })
    .catch((error) => {
      console.error('[MAIN] Falha no registro do Asset Caching Service Worker:', error);
    });
} else {
  console.warn('[MAIN] Service Workers não suportados neste navegador');
}

console.log('[MAIN] Renderizando aplicação React');
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('[MAIN] Elemento root não encontrado no DOM');
  throw new Error('Root element not found');
}

console.log('[MAIN] Elemento root encontrado, criando React root');
createRoot(rootElement).render(<App />);
console.log('[MAIN] Aplicação React renderizada com sucesso');
