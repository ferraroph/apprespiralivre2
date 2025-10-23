import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Heart } from "lucide-react";

const posts = [
  {
    user: "Maria Silva",
    time: "há 2 horas",
    content: "30 dias livre! Nunca pensei que conseguiria. Obrigada a todos pelo apoio! 💚",
    likes: 45,
  },
  {
    user: "João Santos",
    time: "há 5 horas",
    content: "Dia difícil hoje, mas vou conseguir. Uma hora de cada vez! 💪",
    likes: 28,
  },
  {
    user: "Ana Costa",
    time: "há 1 dia",
    content: "Completei minha primeira semana! O app está me ajudando muito 🎉",
    likes: 67,
  },
];

export default function Community() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary text-glow">
          Comunidade
        </h1>
        <p className="text-muted-foreground">
          Você não está sozinho nessa jornada
        </p>
      </div>

      <Card className="card-premium p-6 animate-slide-up">
        <div className="flex items-center justify-around text-center">
          <div>
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">12.4k</p>
            <p className="text-sm text-muted-foreground">Membros Ativos</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">3.2k</p>
            <p className="text-sm text-muted-foreground">Posts Hoje</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <Card
            key={index}
            className="card-premium p-6 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{post.user}</p>
                  <p className="text-sm text-muted-foreground">{post.time}</p>
                </div>
              </div>
              
              <p className="text-foreground">{post.content}</p>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/90"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comentar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
