import { trackEvent } from './analytics';

// Extend Navigator interface for iOS standalone detection
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

// PWA Installation Events
export const PWA_EVENTS = {
  PROMPT_SHOWN: 'pwa_prompt_shown',
  PROMPT_DISMISSED: 'pwa_prompt_dismissed',
  INSTALL_SUCCESS: 'pwa_install_success',
  INSTALL_FAILED: 'pwa_install_failed',
  INSTALL_CANCELLED: 'pwa_install_cancelled',
  
  // Notification Events
  NOTIFICATION_PERMISSION_REQUESTED: 'notification_permission_requested',
  NOTIFICATION_PERMISSION_GRANTED: 'notification_permission_granted',
  NOTIFICATION_PERMISSION_DENIED: 'notification_permission_denied',
  NOTIFICATION_TEST_SENT: 'notification_test_sent',
  
  // Setup Flow Events
  SETUP_FLOW_STARTED: 'setup_flow_started',
  SETUP_FLOW_COMPLETED: 'setup_flow_completed',
  SETUP_FLOW_SKIPPED: 'setup_flow_skipped',
} as const;

export type PWAEvent = typeof PWA_EVENTS[keyof typeof PWA_EVENTS];

interface PWAAnalyticsData {
  platform?: string;
  step?: string;
  error?: string;
  duration?: number;
  success?: boolean;
}

/**
 * Track PWA installation prompt shown
 */
export const trackPWAPromptShown = (platform: string, delay: number) => {
  trackEvent(PWA_EVENTS.PROMPT_SHOWN, {
    platform,
    delay,
    timestamp: Date.now()
  });
};

/**
 * Track PWA installation prompt dismissed
 */
export const trackPWAPromptDismissed = (platform: string, reason: 'user_action' | 'timeout' = 'user_action') => {
  trackEvent(PWA_EVENTS.PROMPT_DISMISSED, {
    platform,
    reason,
    timestamp: Date.now()
  });
};

/**
 * Track successful PWA installation
 */
export const trackPWAInstallSuccess = (platform: string, method: 'automatic' | 'manual' = 'automatic') => {
  trackEvent(PWA_EVENTS.INSTALL_SUCCESS, {
    platform,
    method,
    timestamp: Date.now()
  });
  
  // Store installation date for future reference
  localStorage.setItem('pwa_install_date', new Date().toISOString());
};

/**
 * Track failed PWA installation
 */
export const trackPWAInstallFailed = (platform: string, error: string) => {
  trackEvent(PWA_EVENTS.INSTALL_FAILED, {
    platform,
    error,
    timestamp: Date.now()
  });
};

/**
 * Track cancelled PWA installation
 */
export const trackPWAInstallCancelled = (platform: string) => {
  trackEvent(PWA_EVENTS.INSTALL_CANCELLED, {
    platform,
    timestamp: Date.now()
  });
};

/**
 * Track notification permission request
 */
export const trackNotificationPermissionRequested = (platform: string, context: 'setup_flow' | 'settings' | 'prompt') => {
  trackEvent(PWA_EVENTS.NOTIFICATION_PERMISSION_REQUESTED, {
    platform,
    context,
    timestamp: Date.now()
  });
};

/**
 * Track notification permission granted
 */
export const trackNotificationPermissionGranted = (platform: string, context: 'setup_flow' | 'settings' | 'prompt') => {
  trackEvent(PWA_EVENTS.NOTIFICATION_PERMISSION_GRANTED, {
    platform,
    context,
    timestamp: Date.now()
  });
};

/**
 * Track notification permission denied
 */
export const trackNotificationPermissionDenied = (platform: string, context: 'setup_flow' | 'settings' | 'prompt') => {
  trackEvent(PWA_EVENTS.NOTIFICATION_PERMISSION_DENIED, {
    platform,
    context,
    timestamp: Date.now()
  });
};

/**
 * Track test notification sent
 */
export const trackNotificationTestSent = (platform: string, success: boolean) => {
  trackEvent(PWA_EVENTS.NOTIFICATION_TEST_SENT, {
    platform,
    success,
    timestamp: Date.now()
  });
};

/**
 * Track setup flow events
 */
export const trackSetupFlowStarted = (platform: string, hasApp: boolean) => {
  trackEvent(PWA_EVENTS.SETUP_FLOW_STARTED, {
    platform,
    hasApp,
    timestamp: Date.now()
  });
};

export const trackSetupFlowCompleted = (platform: string, duration: number, steps: string[]) => {
  trackEvent(PWA_EVENTS.SETUP_FLOW_COMPLETED, {
    platform,
    duration,
    steps,
    timestamp: Date.now()
  });
};

export const trackSetupFlowSkipped = (platform: string, step: string, duration: number) => {
  trackEvent(PWA_EVENTS.SETUP_FLOW_SKIPPED, {
    platform,
    step,
    duration,
    timestamp: Date.now()
  });
};

/**
 * Get PWA analytics summary
 */
export const getPWAAnalyticsSummary = () => {
  const installDate = localStorage.getItem('pwa_install_date');
  const dismissedPlatforms = Object.keys(localStorage)
    .filter(key => key.startsWith('pwa-install-dismissed-'))
    .map(key => key.replace('pwa-install-dismissed-', ''));

  return {
    isInstalled: !!(window.matchMedia('(display-mode: standalone)').matches || 
                   navigator.standalone),
    installDate: installDate ? new Date(installDate) : null,
    dismissedPlatforms,
    hasNotificationPermission: 'Notification' in window ? 
      Notification.permission === 'granted' : false,
  };
};

/**
 * Reset PWA analytics data (for testing)
 */
export const resetPWAAnalytics = () => {
  // Remove PWA-related localStorage items
  Object.keys(localStorage)
    .filter(key => key.startsWith('pwa-'))
    .forEach(key => localStorage.removeItem(key));
};

/**
 * Enhanced tracking with user engagement metrics
 */
export interface PWAEngagementMetrics {
  sessionsAfterInstall: number;
  notificationClickRate: number;
  timeToFirstInstall: number;
  installConversionRate: number;
  platformDistribution: Record<string, number>;
}

/**
 * Calculate PWA conversion metrics
 */
export const calculatePWAMetrics = (): PWAEngagementMetrics => {
  // This would typically integrate with your analytics service
  // For now, we'll return example data structure
  
  return {
    sessionsAfterInstall: 0, // Would be calculated from session data
    notificationClickRate: 0, // Would be calculated from notification analytics
    timeToFirstInstall: 0, // Time from first visit to installation
    installConversionRate: 0, // Percentage of users who install
    platformDistribution: {}, // Distribution across platforms
  };
};

/**
 * Track performance metrics for PWA installation
 */
export const trackPWAPerformance = (metric: string, value: number, platform: string) => {
  trackEvent('pwa_performance', {
    metric,
    value,
    platform,
    timestamp: Date.now()
  });
};

/**
 * Enhanced error tracking for PWA
 */
export const trackPWAError = (
  error: Error | string, 
  context: string, 
  platform: string,
  additionalData?: Record<string, unknown>
) => {
  const errorData = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    context,
    platform,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    ...additionalData
  };

  trackEvent('pwa_error', errorData);
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[PWA Error]', errorData);
  }
};