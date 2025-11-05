import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  detectPlatform, 
  isIOSSupported, 
  isPWAInstalled, 
  canShowInstallPrompt as canShowPrompt,
  type Platform 
} from '../lib/platform-detection';
import { 
  trackPWAPromptShown, 
  trackPWAInstallSuccess, 
  trackPWAInstallFailed,
  trackPWAInstallCancelled,
  trackPWAPromptDismissed 
} from '../lib/pwa-analytics';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Extend Navigator interface for iOS standalone detection
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface PWAInstallHook {
  isInstallable: boolean;
  isInstalled: boolean;
  platform: Platform;
  showInstallPrompt: () => Promise<boolean>;
  dismissPrompt: () => void;
  canShowPrompt: boolean;
}

const getStorageKey = (platform: Platform): string => {
  return `pwa-install-dismissed-${platform}`;
};

export const usePWAInstall = (): PWAInstallHook => {
  console.log('[PWA] Hook inicializado');
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled] = useState(isPWAInstalled());
  const platform = detectPlatform();

  console.log('[PWA] Estados iniciais:', { 
    platform, 
    isInstalled, 
    isPWAInstalled: isPWAInstalled(),
    hasDeferredPrompt: !!deferredPrompt,
    isInstallable
  });

  // Check if user has dismissed the prompt before
  const isDismissed = localStorage.getItem(getStorageKey(platform)) === 'true';
  console.log('[PWA] Verificação de dismissal:', { platform, isDismissed });
  
  const canShowPromptValue = useMemo(() => {
    console.log('[PWA] Calculando canShowPromptValue:', { 
      isInstalled, 
      isDismissed, 
      platform,
      hasDeferredPrompt: !!deferredPrompt
    });
    
    if (isInstalled) {
      console.log('[PWA] Não pode mostrar: app já instalado');
      return false;
    }
    if (isDismissed) {
      console.log('[PWA] Não pode mostrar: usuário já dispensou');
      return false;
    }
    
    // Use the utility function but also check for deferredPrompt for non-iOS
    const basicCanShow = canShowPrompt();
    console.log('[PWA] basicCanShow:', basicCanShow);
    if (!basicCanShow) return false;
    
    // For iOS, we can always show manual instructions if supported
    if (platform === 'ios') {
      const iosSupported = isIOSSupported();
      console.log('[PWA] iOS suportado:', iosSupported);
      return iosSupported;
    }
    
    // For other platforms, we need the beforeinstallprompt event
    const canShow = !!deferredPrompt;
    console.log('[PWA] Pode mostrar (não-iOS):', canShow);
    return canShow;
  }, [isInstalled, isDismissed, platform, deferredPrompt]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt fired!', e);
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
      setIsInstallable(false);
      // Clear any dismissed state since app is now installed
      localStorage.removeItem(getStorageKey(platform));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if PWA is installable on iOS (manual process)
    if (platform === 'ios' && isIOSSupported() && !isInstalled) {
      console.log('[PWA] iOS PWA installable detected');
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [platform, isInstalled]);

  const showInstallPrompt = useCallback(async (): Promise<boolean> => {
    if (!canShowPromptValue) return false;

    // For iOS, we can't trigger native prompt, return true to show instructions
    if (platform === 'ios') {
      trackPWAPromptShown(platform, 0);
      return true;
    }

    // For other platforms with beforeinstallprompt support
    if (deferredPrompt) {
      try {
        trackPWAPromptShown(platform, 0);
        
        // Show the install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        // Track the result
        if (outcome === 'accepted') {
          trackPWAInstallSuccess(platform, 'automatic');
        } else {
          trackPWAInstallCancelled(platform);
        }
        
        // Clear the prompt
        setDeferredPrompt(null);
        setIsInstallable(false);
        
        return outcome === 'accepted';
      } catch (error) {
        console.error('Error showing install prompt:', error);
        trackPWAInstallFailed(platform, error instanceof Error ? error.message : 'Unknown error');
        return false;
      }
    }

    return false;
  }, [canShowPromptValue, platform, deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    // Track dismissal
    trackPWAPromptDismissed(platform);
    
    // Mark as dismissed in localStorage to prevent showing again
    localStorage.setItem(getStorageKey(platform), 'true');
    setIsInstallable(false);
  }, [platform]);

  return {
    isInstallable: isInstallable && canShowPromptValue,
    isInstalled,
    platform,
    showInstallPrompt,
    dismissPrompt,
    canShowPrompt: canShowPromptValue
  };
};