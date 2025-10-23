import { Home, Trophy, BookOpen, Users, User, UsersRound, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Trophy, label: "Ligas", path: "/leagues" },
  { icon: UsersRound, label: "Squads", path: "/squads" },
  { icon: Users, label: "Comunidade", path: "/community" },
  { icon: User, label: "Perfil", path: "/profile" },
];

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Check if user is admin
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isAdmin = profile?.role === "admin";
  const displayItems = isAdmin 
    ? [...navItems.slice(0, 4), { icon: Shield, label: "Admin", path: "/admin" }]
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive && "glow-primary"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
