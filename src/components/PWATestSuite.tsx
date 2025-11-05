import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { detectPlatform, getIOSVersion, isPWAInstalled, supportsNotifications } from '../lib/platform-detection';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Check, X, AlertCircle, Smartphone, Monitor, Bell } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export const PWATestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Debug log
  console.log('[PWATestSuite] Component rendered');

  const { 
    isInstalled, 
    isInstallable, 
    platform, 
    canShowPrompt,
    showInstallPrompt 
  } = usePWAInstall();

  const { 
    permission, 
    isSupported: notificationsSupported,
    requestPermission 
  } = usePushNotifications();

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Platform Detection
    const detectedPlatform = detectPlatform();
    results.push({
      name: 'Platform Detection',
      status: detectedPlatform !== 'other' ? 'pass' : 'warning',
      message: `Detected: ${detectedPlatform}`
    });

    // Test 2: PWA Installation Status
    const pwaInstalled = isPWAInstalled();
    results.push({
      name: 'PWA Installation Status',
      status: pwaInstalled ? 'pass' : 'warning',
      message: pwaInstalled ? 'PWA is installed' : 'PWA not installed'
    });

    // Test 3: Before Install Prompt Availability
    results.push({
      name: 'Install Prompt Availability',
      status: isInstallable ? 'pass' : 'warning',
      message: isInstallable ? 'Install prompt available' : 'Install prompt not available'
    });

    // Test 4: iOS Version Check (if iOS)
    if (platform === 'ios') {
      const iosVersion = getIOSVersion();
      const isSupported = iosVersion !== null && iosVersion >= 16.4;
      results.push({
        name: 'iOS PWA Support',
        status: isSupported ? 'pass' : 'fail',
        message: `iOS ${iosVersion ? iosVersion.toFixed(1) : 'Unknown'} - ${isSupported ? 'Supported' : 'Requires 16.4+'}`
      });
    }

    // Test 5: Notification Support
    const notificationSupport = supportsNotifications();
    results.push({
      name: 'Notification Support',
      status: notificationSupport ? 'pass' : 'fail',
      message: notificationSupport ? 'Notifications supported' : 'Notifications not supported'
    });

    // Test 6: Service Worker Support
    const swSupported = 'serviceWorker' in navigator;
    results.push({
      name: 'Service Worker Support',
      status: swSupported ? 'pass' : 'fail',
      message: swSupported ? 'Service Worker available' : 'Service Worker not supported'
    });

    // Test 7: Display Mode Detection
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    results.push({
      name: 'Display Mode',
      status: 'pass',
      message: isStandalone ? 'Standalone (PWA)' : 'Browser'
    });

    // Test 8: Notification Permission Status
    if (notificationSupport) {
      results.push({
        name: 'Notification Permission',
        status: permission === 'granted' ? 'pass' : 'warning',
        message: `Permission: ${permission}`
      });
    }

    // Test 9: BeforeInstallPrompt Event
    const beforeInstallPromptSupported = 'onbeforeinstallprompt' in window;
    results.push({
      name: 'BeforeInstallPrompt Event',
      status: beforeInstallPromptSupported ? 'pass' : 'warning',
      message: beforeInstallPromptSupported ? 'Event supported' : 'Event not supported (expected on iOS)'
    });

    // Test 10: Local Storage Access
    try {
      localStorage.setItem('pwa_test', 'test');
      localStorage.removeItem('pwa_test');
      results.push({
        name: 'Local Storage',
        status: 'pass',
        message: 'Local Storage accessible'
      });
    } catch {
      results.push({
        name: 'Local Storage',
        status: 'fail',
        message: 'Local Storage not accessible'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const testInstallPrompt = async () => {
    try {
      const result = await showInstallPrompt();
      alert(`Install prompt result: ${result ? 'Success' : 'Cancelled/Failed'}`);
    } catch (error) {
      alert(`Install prompt error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testNotificationRequest = async () => {
    try {
      const result = await requestPermission();
      alert(`Notification permission result: ${result ? 'Granted' : 'Denied'}`);
    } catch (error) {
      alert(`Notification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <X className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPlatformIcon()}
            PWA Cross-Platform Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Platform</span>
                <Badge variant="outline" className="capitalize">{platform}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">PWA Status</span>
                <Badge variant={isInstalled ? 'default' : 'secondary'}>
                  {isInstalled ? 'Installed' : 'Not Installed'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Installable</span>
                <Badge variant={isInstallable ? 'default' : 'secondary'}>
                  {isInstallable ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications</span>
                <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                  {permission === 'granted' ? 'Enabled' : permission}
                </Badge>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runTests} disabled={isRunning} size="sm">
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            {isInstallable && canShowPrompt && (
              <Button onClick={testInstallPrompt} variant="outline" size="sm">
                Test Install Prompt
              </Button>
            )}
            
            {notificationsSupported && permission !== 'granted' && (
              <Button onClick={testNotificationRequest} variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Test Notifications
              </Button>
            )}
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Test Results:</h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium text-sm">{result.name}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {testResults.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tests completed: {testResults.filter(r => r.status === 'pass').length} passed, {' '}
                {testResults.filter(r => r.status === 'warning').length} warnings, {' '}
                {testResults.filter(r => r.status === 'fail').length} failed
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};