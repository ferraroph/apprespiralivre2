import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Wind, Book } from "lucide-react";

const contentSections = [
  {
    title: "Meditações",
    icon: Play,
    items: [
      { title: "Respiração Consciente", duration: "5 min" },
      { title: "Liberação de Ansiedade", duration: "10 min" },
      { title: "Força Interior", duration: "7 min" },
    ],
  },
  {
    title: "Técnicas de Respiração",
    icon: Wind,
    items: [
      { title: "Respiração 4-7-8", duration: "3 min" },
      { title: "Respiração Quadrada", duration: "5 min" },
      { title: "Respiração Profunda", duration: "4 min" },
    ],
  },
  {
    title: "Lições",
    icon: Book,
    items: [
      { title: "Entendendo o Vício", duration: "8 min" },
      { title: "Gatilhos Emocionais", duration: "6 min" },
      { title: "Construindo Novos Hábitos", duration: "10 min" },
    ],
  },
];

export default function Content() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary text-glow">
          Conteúdo
        </h1>
        <p className="text-muted-foreground">
          Recursos para fortalecer sua jornada
        </p>
      </div>

      <div className="space-y-8">
        {contentSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          
          return (
            <div
              key={section.title}
              className="space-y-4 animate-slide-up"
              style={{ animationDelay: `${sectionIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>
              
              <div className="grid gap-4">
                {section.items.map((item, itemIndex) => (
                  <Card
                    key={item.title}
                    className="card-premium p-4 animate-scale-in"
                    style={{
                      animationDelay: `${(sectionIndex * 0.3 + itemIndex * 0.1)}s`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.duration}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
