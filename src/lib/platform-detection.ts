export type Platform = 'ios' | 'android' | 'windows' | 'mac' | 'other';

// Extend Navigator interface for iOS standalone detection
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

/**
 * Detect the current platform based on user agent
 */
export function detectPlatform(): Platform {
  console.log('[PLATFORM] Detectando plataforma');
  
  const userAgent = navigator.userAgent.toLowerCase();
  console.log('[PLATFORM] User Agent:', userAgent);
  
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isWindows = /windows/.test(userAgent);
  const isMac = /macintosh|mac os x/.test(userAgent);

  console.log('[PLATFORM] Detecções:', { isIOS, isAndroid, isWindows, isMac });

  let platform: Platform;
  if (isIOS) platform = 'ios';
  else if (isAndroid) platform = 'android';
  else if (isWindows) platform = 'windows';
  else if (isMac) platform = 'mac';
  else platform = 'other';

  console.log('[PLATFORM] Plataforma detectada:', platform);
  return platform;
}

/**
 * Check if iOS version supports PWA installation (16.4+)
 */
export function isIOSSupported(): boolean {
  console.log('[PLATFORM] Verificando suporte iOS para PWA');
  
  const userAgent = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  
  console.log('[PLATFORM] É iOS?', isIOS);
  if (!isIOS) return false;
  
  const version = getIOSVersion();
  console.log('[PLATFORM] Versão iOS:', version);
  if (version === null) return false;
  
  // iOS 16.4+ required for PWA support
  const isSupported = version >= 16.4;
  console.log('[PLATFORM] iOS suporta PWA (16.4+)?', isSupported);
  return isSupported;
}

/**
 * Check if PWA is currently installed
 */
export function isPWAInstalled(): boolean {
  console.log('[PLATFORM] Verificando se PWA está instalado');
  
  // Check if running in standalone mode (PWA installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  console.log('[PLATFORM] Display mode standalone?', isStandalone);
  
  // Check for iOS PWA using navigator.standalone
  const isIOSStandalone = 'standalone' in navigator && navigator.standalone === true;
  console.log('[PLATFORM] iOS standalone?', isIOSStandalone);
  
  const result = isStandalone || isIOSStandalone;
  console.log('[PLATFORM] PWA está instalado?', result);
  
  return result;
}

/**
 * Check if install prompt can be shown
 */
export function canShowInstallPrompt(): boolean {
  const platform = detectPlatform();
  
  // Don't show if already installed
  if (isPWAInstalled()) return false;
  
  // Check if user has dismissed before
  const storageKey = `pwa-install-dismissed-${platform}`;
  const isDismissed = localStorage.getItem(storageKey) === 'true';
  if (isDismissed) return false;
  
  // For iOS, check if supported version
  if (platform === 'ios') {
    return isIOSSupported();
  }
  
  // For other platforms, we need beforeinstallprompt event
  // This will be checked in the component/hook that uses this
  return true;
}

/**
 * Get iOS version number (e.g., 16.4 returns 16.4)
 */
export function getIOSVersion(): number | null {
  const userAgent = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  
  if (!isIOS) return null;
  
  // Match iOS version pattern (OS 16_4_1 or Version/16.4)
  const match = userAgent.match(/OS (\d+)_(\d+)/);
  if (match) {
    const majorVersion = parseInt(match[1]);
    const minorVersion = parseInt(match[2]);
    return parseFloat(`${majorVersion}.${minorVersion}`);
  }
  
  // Alternative pattern for some user agents
  const versionMatch = userAgent.match(/Version\/(\d+)\.(\d+)/);
  if (versionMatch) {
    const majorVersion = parseInt(versionMatch[1]);
    const minorVersion = parseInt(versionMatch[2]);
    return parseFloat(`${majorVersion}.${minorVersion}`);
  }
  
  return null;
}

/**
 * Check if browser supports beforeinstallprompt event
 */
export function supportsBeforeInstallPrompt(): boolean {
  return 'onbeforeinstallprompt' in window;
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
}

/**
 * Get platform-specific install instructions
 */
export function getInstallInstructions(platform: Platform): string[] {
  switch (platform) {
    case 'ios':
      return [
        'Toque no ícone "Compartilhar" na barra inferior',
        'Role para baixo e toque em "Adicionar à Tela Inicial"',
        'Toque em "Adicionar" no canto superior direito',
        'O app aparecerá na sua tela inicial'
      ];
    case 'android':
      return [
        'Toque no menu do navegador (⋮)',
        'Selecione "Instalar app" ou "Adicionar à tela inicial"',
        'Confirme a instalação',
        'O app aparecerá na sua tela inicial'
      ];
    case 'windows':
    case 'mac':
      return [
        'Clique no ícone de instalação na barra de endereços',
        'Ou vá em Menu > Instalar Respira Livre',
        'Confirme a instalação',
        'O app será adicionado ao seu sistema'
      ];
    default:
      return [
        'Procure pela opção "Instalar" no menu do seu navegador',
        'Ou "Adicionar à tela inicial"',
        'Confirme a instalação'
      ];
  }
}

/**
 * Check if notifications are supported
 */
export function supportsNotifications(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!supportsNotifications()) return 'unsupported';
  return Notification.permission;
}

/**
 * Storage keys for various PWA states
 */
export const PWA_STORAGE_KEYS = {
  DISMISSED: (platform: Platform) => `pwa-install-dismissed-${platform}`,
  INSTALL_PROMPTED: 'pwa-install-prompted',
  NOTIFICATION_PROMPTED: 'pwa-notification-prompted',
  INSTALL_DATE: 'pwa-install-date'
} as const;