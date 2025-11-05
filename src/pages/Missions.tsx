import { ResourcesHeader } from "@/components/gamification/ResourcesHeader";
import { MissionCard } from "@/components/gamification/MissionCard";
import { BossBattleCard } from "@/components/gamification/BossBattleCard";
import { useMissions } from "@/hooks/useMissions";
import { useBosses } from "@/hooks/useBosses";
import { Loader2, Swords } from "lucide-react";
import { toast } from "sonner";

export default function Missions() {
  const { missions, loading: missionsLoading, claimReward } = useMissions();
  const { bosses, canFightDailyBoss, loading: bossesLoading } = useBosses();

  const dailyMissions = missions.filter((m) => m.mission.type === "daily");
  const weeklyMissions = missions.filter((m) => m.mission.type === "weekly");
  const dailyBoss = bosses.find((b) => b.difficulty === "daily");

  const handleBattleStart = () => {
    toast.info("Boss Battle em desenvolvimento! Em breve você poderá enfrentar o boss de forma interativa.");
  };

  if (missionsLoading || bossesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Resources Header */}
      <ResourcesHeader />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
          <Swords className="h-8 w-8 text-primary" />
          Missões & Desafios
        </h1>
        <p className="text-muted-foreground">
          Complete missões diárias e semanais para ganhar recompensas épicas!
        </p>
      </div>

      {/* Boss Battle Section */}
      {dailyBoss && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            👹 Boss Diário
          </h2>
          <BossBattleCard
            boss={dailyBoss}
            canFight={canFightDailyBoss()}
            onBattleStart={handleBattleStart}
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
    </div>
  );
}
