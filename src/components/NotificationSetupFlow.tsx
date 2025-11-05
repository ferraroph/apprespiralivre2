import React, { useState, useEffect } from 'react';
import { Bell, Download, Check, AlertCircle, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { detectPlatform, supportsNotifications, getNotificationPermission } from '../lib/platform-detection';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface NotificationSetupFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  className?: string;
}

type FlowStep = 'install' | 'permission' | 'test' | 'complete';

interface StepConfig {
  id: FlowStep;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const NotificationSetupFlow: React.FC<NotificationSetupFlowProps> = ({
  onComplete,
  onSkip,
  autoStart = false,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('install');
  const [isVisible, setIsVisible] = useState(autoStart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isInstalled, 
    isInstallable, 
    showInstallPrompt, 
    platform 
  } = usePWAInstall();
  
  const {
    permission,
    isSupported: notificationsSupported,
    requestPermission,
    loading: notificationLoading
  } = usePushNotifications();

  // Create test notification function
  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }
    
    // Send a simple test notification
    new Notification('Respira Livre', {
      body: 'Notificações configuradas com sucesso! 🎉',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test-notification'
    });
  };

  const steps: StepConfig[] = [
    {
      id: 'install',
      title: 'Instalar App',
      description: 'Primeiro, vamos instalar o Respira Livre como um app',
      icon: <Download className="h-5 w-5" />
    },
    {
      id: 'permission',
      title: 'Permitir Notificações',
      description: 'Ative as notificações para receber lembretes',
      icon: <Bell className="h-5 w-5" />
    },
    {
      id: 'test',
      title: 'Testar Notificação',
      description: 'Vamos enviar uma notificação de teste',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      id: 'complete',
      title: 'Configuração Completa',
      description: 'Tudo pronto! Você receberá lembretes personalizados',
      icon: <Check className="h-5 w-5" />
    }
  ];

  // Determine initial step based on current state
  useEffect(() => {
    if (isInstalled) {
      if (permission === 'granted') {
        setCurrentStep('complete');
      } else if (permission === 'denied') {
        setCurrentStep('permission');
      } else {
        setCurrentStep('permission');
      }
    } else if (isInstallable) {
      setCurrentStep('install');
    } else {
      setCurrentStep('permission');
    }
  }, [isInstalled, isInstallable, permission]);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const getProgress = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const handleInstallStep = async () => {
    if (!isInstallable) {
      setCurrentStep('permission');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const success = await showInstallPrompt();
      if (success) {
        setCurrentStep('permission');
      } else {
        // If install failed/was cancelled, still allow to continue
        setCurrentStep('permission');
      }
    } catch (err) {
      setError('Erro ao instalar o app. Você pode continuar com as notificações.');
      setCurrentStep('permission');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermissionStep = async () => {
    if (!notificationsSupported) {
      setError('Notificações não são suportadas neste navegador.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await requestPermission();
      if (result) {
        setCurrentStep('test');
      } else {
        setError('Permissão de notificação foi negada. Você pode ativar nas configurações do navegador.');
      }
    } catch (err) {
      setError('Erro ao solicitar permissão de notificações.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestStep = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await sendTestNotification();
      setCurrentStep('complete');
      
      // Auto-complete after successful test
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err) {
      setError('Erro ao enviar notificação de teste. Mas as notificações estão ativas!');
      setCurrentStep('complete');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  const handleClose = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'install':
        return (
          <div className="space-y-4">
            <Alert>
              <Download className="h-4 w-4" />
              <AlertDescription>
                {platform === 'ios' 
                  ? 'Para receber notificações no iOS, primeiro adicione o app à tela inicial.'
                  : 'Instale o app para uma melhor experiência e notificações confiáveis.'
                }
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button 
                onClick={handleInstallStep}
                disabled={isProcessing || !isInstallable}
                className="flex-1"
              >
                {isProcessing ? 'Instalando...' : 'Instalar App'}
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep('permission')}>
                Pular
              </Button>
            </div>
          </div>
        );

      case 'permission': {
        const currentPermission = getNotificationPermission();
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className={`inline-flex p-3 rounded-full ${
                currentPermission === 'granted' ? 'bg-green-100 text-green-600' :
                currentPermission === 'denied' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <Bell className="h-6 w-6" />
              </div>
              
              <Badge variant={
                currentPermission === 'granted' ? 'default' :
                currentPermission === 'denied' ? 'destructive' :
                'secondary'
              }>
                {currentPermission === 'granted' ? 'Permitido' :
                 currentPermission === 'denied' ? 'Negado' :
                 'Pendente'}
              </Badge>
            </div>

            {currentPermission !== 'granted' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {currentPermission === 'denied'
                    ? 'As notificações foram negadas. Você pode ativar nas configurações do navegador.'
                    : 'Permitir notificações para receber lembretes de exercícios respiratórios.'
                  }
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {currentPermission !== 'granted' && (
                <Button 
                  onClick={handlePermissionStep}
                  disabled={isProcessing || !notificationsSupported}
                  className="flex-1"
                >
                  {isProcessing ? 'Solicitando...' : 'Permitir Notificações'}
                </Button>
              )}
              
              {currentPermission === 'granted' && (
                <Button onClick={() => setCurrentStep('test')} className="flex-1">
                  Continuar
                </Button>
              )}
              
              <Button variant="outline" onClick={() => setCurrentStep('test')}>
                Pular
              </Button>
            </div>
          </div>
        );
      }

      case 'test':
        return (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Vamos enviar uma notificação de teste para garantir que tudo está funcionando.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button 
                onClick={handleTestStep}
                disabled={isProcessing || permission !== 'granted'}
                className="flex-1"
              >
                {isProcessing ? 'Enviando...' : 'Enviar Teste'}
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep('complete')}>
                Pular
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600">
              <Check className="h-8 w-8" />
            </div>
            
            <div>
              <h3 className="font-semibold text-green-800 mb-1">
                Configuração Completa!
              </h3>
              <p className="text-sm text-muted-foreground">
                Você receberá lembretes personalizados para seus exercícios respiratórios.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Começar a Usar
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isVisible) {
    return null;
  }

  const currentStepConfig = steps.find(step => step.id === currentStep);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              Configuração {getCurrentStepIndex() + 1} de {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Progress value={getProgress()} className="h-2 mb-4" />
          
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
              {currentStepConfig?.icon}
            </div>
            <div>
              <CardTitle className="text-lg">
                {currentStepConfig?.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentStepConfig?.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};