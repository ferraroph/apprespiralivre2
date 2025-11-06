import { useState } from "react";
import { ResourcesHeader } from "@/components/gamification/ResourcesHeader";
import { MissionCard } from "@/components/gamification/MissionCard";
import { BossBattleCard } from "@/components/gamification/BossBattleCard";
import { BossBattleDialog } from "@/components/gamification/BossBattleDialog";
import { ChestCard } from "@/components/gamification/ChestCard";
import { ShopCard } from "@/components/gamification/ShopCard";
import { useMissions } from "@/hooks/useMissions";
import { useBosses } from "@/hooks/useBosses";
import { useChests } from "@/hooks/useChests";
import { useShop } from "@/hooks/useShop";
import { Loader2, Swords, Sparkles, ShoppingBag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Missions() {
  const { missions, loading: missionsLoading, claimReward } = useMissions();
  const { bosses, canFightDailyBoss, loading: bossesLoading, todayEncounter } = useBosses();
  const { chests, loading: chestsLoading, openChest } = useChests();
  const { items: shopItems, loading: shopLoading, purchaseItem } = useShop();
  
  const [battleDialogOpen, setBattleDialogOpen] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<any>(null);

  const dailyMissions = missions.filter((m) => m.mission.type === "daily");
  const weeklyMissions = missions.filter((m) => m.mission.type === "weekly");
  const dailyBoss = bosses.find((b) => b.difficulty === "daily");
  const unopenedChests = chests.filter((c) => !c.opened);

  const handleBattleStart = (boss: any) => {
    setSelectedBoss(boss);
    setBattleDialogOpen(true);
  };

  const handleBattleComplete = () => {
    // Refresh data after battle
    window.location.reload();
  };

  if (missionsLoading || bossesLoading || chestsLoading || shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Resources Header */}
      <ResourcesHeader />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
          <Swords className="h-8 w-8 text-primary" />
          Missões & Desafios
        </h1>
        <p className="text-muted-foreground">
          Complete missões, derrote bosses, abra baús e compre power-ups!
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="missions">
            <Swords className="h-4 w-4 mr-2" />
            Missões
          </TabsTrigger>
          <TabsTrigger value="chests">
            <Sparkles className="h-4 w-4 mr-2" />
            Baús {unopenedChests.length > 0 && `(${unopenedChests.length})`}
          </TabsTrigger>
          <TabsTrigger value="shop">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Loja
          </TabsTrigger>
        </TabsList>

        {/* Missions Tab */}
        <TabsContent value="missions" className="space-y-6 mt-6">
          {/* Boss Battle Section */}
          {dailyBoss && (
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                👹 Boss Diário
              </h2>
              <BossBattleCard
                boss={dailyBoss}
                canFight={canFightDailyBoss()}
                onBattleStart={() => handleBattleStart(dailyBoss)}
              />
            </section>
          )}

          {/* Daily Missions */}
          <section>
            <h2 className="text-2xl font-bold mb-4">📅 Missões Diárias</h2>
            <div className="grid gap-4">
              {dailyMissions.length > 0 ? (
                dailyMissions.map((userMission) => (
                  <MissionCard
                    key={userMission.id}
                    userMission={userMission}
                    onClaim={claimReward}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma missão diária disponível no momento.
                </p>
              )}
            </div>
          </section>

          {/* Weekly Missions */}
          <section>
            <h2 className="text-2xl font-bold mb-4">📆 Missões Semanais</h2>
            <div className="grid gap-4">
              {weeklyMissions.length > 0 ? (
                weeklyMissions.map((userMission) => (
                  <MissionCard
                    key={userMission.id}
                    userMission={userMission}
                    onClaim={claimReward}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma missão semanal disponível no momento.
                </p>
              )}
            </div>
          </section>
        </TabsContent>

        {/* Chests Tab */}
        <TabsContent value="chests" className="mt-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">🎁 Seus Baús</h2>
            {chests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chests.map((chest) => (
                  <ChestCard
                    key={chest.id}
                    chest={chest}
                    onOpen={openChest}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Você ainda não tem baús. Complete missões e check-ins para ganhar!
              </p>
            )}
          </section>
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop" className="mt-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">🛒 Loja de Power-ups</h2>
            {shopItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.map((item) => (
                  <ShopCard
                    key={item.id}
                    item={item}
                    onPurchase={purchaseItem}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Nenhum item disponível no momento.
              </p>
            )}
          </section>
        </TabsContent>
      </Tabs>

      {/* Boss Battle Dialog */}
      {selectedBoss && (
        <BossBattleDialog
          boss={selectedBoss}
          open={battleDialogOpen}
          onOpenChange={setBattleDialogOpen}
          onComplete={handleBattleComplete}
        />
      )}
    </div>
  );
}
