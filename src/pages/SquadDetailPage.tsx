import { SquadDetail } from "@/components/SquadDetail";
import { SquadChat } from "@/components/SquadChat";
import { useParams } from "react-router-dom";

export default function SquadDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Squad não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <SquadDetail />
      <SquadChat squadId={id} />
    </div>
  );
}
