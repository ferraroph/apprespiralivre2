import React, { useState } from 'react';
import { Share, Plus, Home, ChevronRight, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { getIOSVersion } from '../lib/platform-detection';

interface IOSInstallInstructionsProps {
  onDismiss?: () => void;
  onComplete?: () => void;
  className?: string;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

export const IOSInstallInstructions: React.FC<IOSInstallInstructionsProps> = ({
  onDismiss,
  onComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const iosVersion = getIOSVersion();

  const steps: Step[] = [
    {
      id: 1,
      title: 'Toque no ícone Compartilhar',
      description: 'Procure o ícone na barra inferior do Safari',
      icon: <Share className="h-6 w-6" />,
      details: [
        'Localize o ícone de compartilhamento na parte inferior da tela',
        'O ícone parece uma caixa com uma seta apontando para cima',
        'Está localizado ao lado da barra de endereços'
      ]
    },
    {
      id: 2,
      title: 'Role para baixo no menu',
      description: 'Encontre "Adicionar à Tela Inicial"',
      icon: <Plus className="h-6 w-6" />,
      details: [
        'Um menu aparecerá na parte inferior da tela',
        'Role para baixo até encontrar "Adicionar à Tela Inicial"',
        'O ícone tem um símbolo de "+" ao lado do texto'
      ]
    },
    {
      id: 3,
      title: 'Toque em "Adicionar à Tela Inicial"',
      description: 'Selecione a opção de instalação',
      icon: <Home className="h-6 w-6" />,
      details: [
        'Toque na opção "Adicionar à Tela Inicial"',
        'Uma nova tela aparecerá para confirmar a instalação',
        'Você verá o ícone e nome do app "Respira Livre"'
      ]
    },
    {
      id: 4,
      title: 'Confirme a instalação',
      description: 'Toque em "Adicionar" no canto superior direito',
      icon: <Check className="h-6 w-6" />,
      details: [
        'Toque no botão "Adicionar" azul no canto superior direito',
        'O app será adicionado à sua tela inicial',
        'Você poderá acessá-lo como qualquer outro app'
      ]
    }
  ];

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (stepId < steps.length) {
      setCurrentStep(stepId);
    } else {
      onComplete?.();
    }
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: number) => currentStep === stepId - 1;

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            iOS {iosVersion ? iosVersion.toFixed(1) : 'Safari'}
          </Badge>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <CardTitle className="text-lg font-bold text-primary">
          Como Instalar no iOS
        </CardTitle>
        
        <p className="text-sm text-muted-foreground">
          Siga os passos abaixo para adicionar o Respira Livre à sua tela inicial
        </p>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 w-8 rounded-full transition-colors ${
                isStepCompleted(step.id)
                  ? 'bg-green-500'
                  : isStepCurrent(step.id)
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              isStepCurrent(step.id)
                ? 'border-primary bg-primary/5'
                : isStepCompleted(step.id)
                ? 'border-green-500 bg-green-50'
                : 'border-muted bg-muted/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Step number/icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isStepCompleted(step.id)
                    ? 'bg-green-500 text-white'
                    : isStepCurrent(step.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isStepCompleted(step.id) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {step.description}
                </p>
                
                {/* Expandable details for current step */}
                {isStepCurrent(step.id) && (
                  <div className="space-y-2 mt-3">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start gap-2 text-xs">
                        <ChevronRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                    
                    <Button
                      size="sm"
                      onClick={() => handleStepComplete(step.id)}
                      className="mt-3 w-full"
                      variant={isStepCompleted(step.id) ? "secondary" : "default"}
                    >
                      {isStepCompleted(step.id) ? 'Concluído' : 'Próximo Passo'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Completion message */}
        {completedSteps.length === steps.length && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 mb-1">
              Instalação Concluída!
            </h3>
            <p className="text-sm text-green-600">
              O Respira Livre foi adicionado à sua tela inicial. 
              Agora você pode acessá-lo como um app nativo.
            </p>
          </div>
        )}

        {/* Help section */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 text-sm mb-1">
            💡 Dica importante
          </h4>
          <p className="text-xs text-blue-600">
            Após a instalação, abra o app pela tela inicial para habilitar 
            as notificações e funcionalidades offline.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};