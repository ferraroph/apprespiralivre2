import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Settings, LogOut, User as UserIcon } from "lucide-react";

const achievements = [
  { title: "Primeiro Dia", unlocked: true },
  { title: "Uma Semana Forte", unlocked: true },
  { title: "Mestre do Streak", unlocked: false },
  { title: "Guardião da Saúde", unlocked: false },
];

export default function Profile() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="card-premium p-8 text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 glow-primary mb-4">
          <UserIcon className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Usuário Demo</h1>
        <p className="text-muted-foreground mb-4">usuario@email.com</p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-2xl font-bold text-primary">Nível 5</p>
            <p className="text-sm text-muted-foreground">Nível</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">23</p>
            <p className="text-sm text-muted-foreground">Dias Livre</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">4.532</p>
            <p className="text-sm text-muted-foreground">XP Total</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Conquistas
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <Card
              key={achievement.title}
              className={`card-premium p-6 text-center animate-scale-in ${
                achievement.unlocked ? "glow-primary" : "opacity-50"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Award
                className={`h-12 w-12 mx-auto mb-3 ${
                  achievement.unlocked ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="font-semibold">{achievement.title}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-primary/30 hover:bg-primary/10 hover:border-primary"
        >
          <Settings className="h-5 w-5" />
          Configurações
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3 border-destructive/30 hover:bg-destructive/10 hover:border-destructive text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
