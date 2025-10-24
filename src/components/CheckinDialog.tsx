import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smile, Meh, Frown } from "lucide-react";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const moods = [
  { id: "good", label: "Ótimo", icon: Smile, color: "text-green-500" },
  { id: "neutral", label: "Ok", icon: Meh, color: "text-yellow-500" },
  { id: "bad", label: "Difícil", icon: Frown, color: "text-red-500" },
];

export function CheckinDialog({ open, onOpenChange, onSuccess }: CheckinDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");

  const handleCheckin = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("checkin", {
        body: { mood, notes },
      });

      if (error) throw error;

      // Fetch updated progress to get cigarettes_avoided
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progressData } = await supabase
          .from("progress")
          .select("cigarettes_avoided")
          .eq("user_id", user.id)
          .single();

        // Track checkin_completed event
        trackEvent(AnalyticsEvents.CHECKIN_COMPLETED, {
          streak_count: data.streak,
          cigarettes_avoided: progressData?.cigarettes_avoided || 0,
          mood,
        });
      }

      toast({
        title: "Check-in realizado!",
        description: `+${data.coinsEarned} RespiCoins, +${data.xpEarned} XP`,
      });

      onSuccess();
      onOpenChange(false);
      setMood("");
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md"
>
        <DialogHeader>
          <DialogTitle className="text-primary text-glow">Check-in Diário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Como você está se sentindo?</Label>
            <div className="grid grid-cols-3 gap-3">
              {moods.map((m) => {
                const Icon = m.icon;
                return (
                  <Button
                    key={m.id}
                    variant={mood === m.id ? "default" : "outline"}
                    className={`flex flex-col gap-2 h-auto py-4 ${
                      mood === m.id ? "glow-primary-subtle" : ""
                    }`}
                    onClick={() => setMood(m.id)}
                  >
                    <Icon className={`h-8 w-8 ${m.color}`} />
                    <span className="text-sm">{m.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Como foi seu dia? Algum desafio?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 caracteres
            </p>
          </div>

          <Button
            className="w-full glow-primary-subtle"
            onClick={handleCheckin}
            disabled={!mood || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirmar Check-in"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
