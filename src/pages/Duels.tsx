import { Loader2, Swords } from "lucide-react";
import { useDuels } from "@/hooks/useDuels";
import { DuelCard } from "@/components/gamification/DuelCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Duels() {
  const { duels, loading, acceptDuel } = useDuels();

  const pendingDuels = duels.filter((d) => d.status === "pending");
  const activeDuels = duels.filter((d) => d.status === "active");
  const completedDuels = duels.filter((d) => d.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
          <Swords className="h-8 w-8 text-primary" />
          Duelos 1v1
        </h1>
        <p className="text-muted-foreground">
          Desafie outros jogadores e prove sua superioridade!
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pendentes ({pendingDuels.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativos ({activeDuels.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completados ({completedDuels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingDuels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingDuels.map((duel) => (
                <DuelCard key={duel.id} duel={duel} onAccept={acceptDuel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhum duelo pendente no momento.
            </p>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {activeDuels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDuels.map((duel) => (
                <DuelCard key={duel.id} duel={duel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhum duelo ativo. Desafie alguém para começar!
            </p>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedDuels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedDuels.map((duel) => (
                <DuelCard key={duel.id} duel={duel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhum duelo completado ainda.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
