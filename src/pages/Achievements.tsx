import { Loader2, Trophy } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Achievements() {
  const { achievements, loading } = useAchievements();

  const bronzeAchievements = achievements.filter((a) => a.rarity === "bronze");
  const silverAchievements = achievements.filter((a) => a.rarity === "silver");
  const goldAchievements = achievements.filter((a) => a.rarity === "gold");
  const platinumAchievements = achievements.filter((a) => a.rarity === "platinum");
  const diamondAchievements = achievements.filter((a) => a.rarity === "diamond");

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
          <Trophy className="h-8 w-8 text-primary" />
          Conquistas
        </h1>
        <p className="text-muted-foreground">
          Desbloqueie conquistas e ganhe recompensas incríveis!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-card rounded-lg">
          <p className="text-2xl font-bold text-primary">{achievements.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{bronzeAchievements.length}</p>
          <p className="text-sm text-muted-foreground">Bronze</p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg">
          <p className="text-2xl font-bold text-yellow-400">{goldAchievements.length}</p>
          <p className="text-sm text-muted-foreground">Ouro</p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg">
          <p className="text-2xl font-bold text-blue-400">{diamondAchievements.length}</p>
          <p className="text-sm text-muted-foreground">Diamante</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="bronze">Bronze</TabsTrigger>
          <TabsTrigger value="silver">Prata</TabsTrigger>
          <TabsTrigger value="gold">Ouro</TabsTrigger>
          <TabsTrigger value="diamond">Diamante</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {achievements.length > 0 ? (
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Você ainda não desbloqueou nenhuma conquista. Continue jogando!
            </p>
          )}
        </TabsContent>

        <TabsContent value="bronze" className="mt-6">
          {bronzeAchievements.length > 0 ? (
            <div className="grid gap-4">
              {bronzeAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma conquista bronze ainda.
            </p>
          )}
        </TabsContent>

        <TabsContent value="silver" className="mt-6">
          {silverAchievements.length > 0 ? (
            <div className="grid gap-4">
              {silverAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma conquista prata ainda.
            </p>
          )}
        </TabsContent>

        <TabsContent value="gold" className="mt-6">
          {goldAchievements.length > 0 ? (
            <div className="grid gap-4">
              {goldAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma conquista ouro ainda.
            </p>
          )}
        </TabsContent>

        <TabsContent value="diamond" className="mt-6">
          {diamondAchievements.length > 0 ? (
            <div className="grid gap-4">
              {diamondAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhuma conquista diamante ainda.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
