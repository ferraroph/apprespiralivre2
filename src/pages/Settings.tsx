import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Moon, Sun, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-primary">Configurações</h1>
      </div>

      <Card className="card-premium p-6 animate-slide-up">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notificações
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Notificações Push</Label>
              <p className="text-sm text-muted-foreground">
                Receba lembretes e atualizações
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </div>
      </Card>

      <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          Aparência
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode">Modo Escuro</Label>
              <p className="text-sm text-muted-foreground">
                Tema escuro para o aplicativo
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>
      </Card>

      <Card className="card-premium p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Sobre
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Respira Livre v1.0.0</p>
          <p>© 2024 Respira Livre. Todos os direitos reservados.</p>
        </div>
      </Card>
    </div>
  );
}
