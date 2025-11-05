import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getInstallInstructions } from '../lib/platform-detection';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Badge } from './ui/badge';

interface InstallPromptProps {
  onInstallSuccess?: () => void;
  onDismiss?: () => void;
  autoShow?: boolean;
  delay?: number;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  onInstallSuccess,
  onDismiss,
  autoShow = true,
  delay = 3000
}) => {
  console.log('[UI] InstallPrompt inicializado');
  
  const [isOpen, setIsOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { 
    isInstallable, 
    platform, 
    showInstallPrompt, 
    dismissPrompt,
    canShowPrompt 
  } = usePWAInstall();

  console.log('[UI] InstallPrompt estado:', { 
    isInstallable, 
    platform, 
    canShowPrompt, 
    autoShow, 
    isOpen,
    isInstalling
  });

  // Auto-show logic with delay
  useEffect(() => {
    console.log('[UI] InstallPrompt verificação de auto-show:', { 
      autoShow, 
      isInstallable, 
      canShowPrompt, 
      delay 
    });
    
    if (autoShow && isInstallable && canShowPrompt) {
      console.log(`[UI] InstallPrompt configurando timer para ${delay}ms`);
      const timer = setTimeout(() => {
        console.log('[UI] InstallPrompt timer disparado - abrindo prompt');
        setIsOpen(true);
      }, delay);

      return () => {
        console.log('[UI] InstallPrompt limpando timer');
        clearTimeout(timer);
      };
    }
  }, [autoShow, isInstallable, canShowPrompt, delay]);

  const handleInstall = async () => {
    console.log('[UI] InstallPrompt iniciando instalação');
    setIsInstalling(true);
    try {
      const success = await showInstallPrompt();
      console.log('[UI] InstallPrompt resultado da instalação:', success);
      if (success) {
        console.log('[UI] InstallPrompt instalação bem-sucedida - fechando prompt');
        setIsOpen(false);
        onInstallSuccess?.();
      }
    } catch (error) {
      console.error('[UI] InstallPrompt falha na instalação:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    console.log('[UI] InstallPrompt usuário dispensou o prompt');
    dismissPrompt();
    setIsOpen(false);
    onDismiss?.();
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios':
        return <Smartphone className="h-6 w-6 text-primary" />;
      case 'android':
        return <Smartphone className="h-6 w-6 text-primary" />;
      case 'windows':
      case 'mac':
        return <Monitor className="h-6 w-6 text-primary" />;
      default:
        return <Download className="h-6 w-6 text-primary" />;
    }
  };

  const getPlatformTitle = () => {
    switch (platform) {
      case 'ios':
        return 'Adicione à Tela Inicial';
      case 'android':
        return 'Instalar Respira Livre';
      case 'windows':
        return 'Instalar no Windows';
      case 'mac':
        return 'Instalar no Mac';
      default:
        return 'Instalar App';
    }
  };

  const getPlatformDescription = () => {
    switch (platform) {
      case 'ios':
        return 'Acesse o Respira Livre direto da sua tela inicial, sem ocupar espaço de armazenamento adicional.';
      case 'android':
        return 'Instale o Respira Livre como um app nativo. Acesso rápido e notificações personalizadas.';
      case 'windows':
        return 'Adicione o Respira Livre à sua barra de tarefas e menu iniciar para acesso rápido.';
      case 'mac':
        return 'Adicione o Respira Livre ao seu Dock para acesso rápido e melhor experiência.';
      default:
        return 'Instale o Respira Livre para uma experiência melhor e mais rápida.';
    }
  };

  // iOS requires manual instructions instead of automatic prompt
  const isIOSManualInstall = platform === 'ios';
  const instructions = getInstallInstructions(platform);

  if (!isInstallable || !canShowPrompt) {
    return null;
  }

  // iOS Banner Style (non-modal)
  if (isIOSManualInstall && isOpen) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary-foreground shadow-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share className="h-5 w-5 text-primary-foreground" />
              <div>
                <p className="text-sm font-medium text-primary-foreground">
                  Instalar Respira Livre
                </p>
                <p className="text-xs text-primary-foreground/80">
                  Toque em <strong>Compartilhar</strong> → <strong>Adicionar à Tela Inicial</strong>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Modal Style for other platforms
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getPlatformIcon()}
          </div>
          <DialogTitle className="text-xl font-bold">
            {getPlatformTitle()}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {getPlatformDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits list */}
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Acesso offline completo</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Notificações de lembrete</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Performance otimizada</span>
            </div>
          </div>

          {/* Platform badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="capitalize">
              {platform === 'ios' ? 'iOS Safari' : platform}
            </Badge>
          </div>

          {/* iOS Manual Instructions */}
          {isIOSManualInstall && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-center mb-3">
                Siga os passos para instalar:
              </p>
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <span className="text-muted-foreground">{instruction}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Agora não
          </Button>
          {!isIOSManualInstall && (
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1"
            >
              {isInstalling ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Instalando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Instalar
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};