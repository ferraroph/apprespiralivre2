import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { Bell, Clock, Zap } from 'lucide-react';

export const LocalNotificationTest = () => {
  const { sendLocalNotification, scheduleReminder, sendInstantNotification } = useLocalNotifications();
  const [title, setTitle] = useState('Lembrete Respira Livre');
  const [message, setMessage] = useState('Você está indo muito bem! Continue sua jornada.');
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [url, setUrl] = useState('');

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notificações Locais (Despia)
        </CardTitle>
        <CardDescription>
          Teste o sistema de notificações nativas usando Despia SDK
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título da notificação"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <Input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite a mensagem da notificação"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="delay">Atraso (segundos)</Label>
          <Input
            id="delay"
            type="number"
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Number(e.target.value))}
            placeholder="Segundos até a notificação"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL (opcional)</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <Button
            onClick={() => sendInstantNotification(title, message, url)}
            className="gap-2"
            variant="default"
          >
            <Zap className="h-4 w-4" />
            Enviar Agora
          </Button>

          <Button
            onClick={() => scheduleReminder(title, message, delaySeconds)}
            className="gap-2"
            variant="secondary"
          >
            <Clock className="h-4 w-4" />
            Agendar
          </Button>

          <Button
            onClick={() => sendLocalNotification({ title, message, delaySeconds, url })}
            className="gap-2"
            variant="outline"
          >
            <Bell className="h-4 w-4" />
            Personalizada
          </Button>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong>Como funciona:</strong> Despia age como uma ponte entre seu app e o sistema nativo de notificações do dispositivo. 
            As notificações funcionam mesmo quando o app está fechado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
