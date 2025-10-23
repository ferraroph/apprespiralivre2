import { Home, Trophy, BookOpen, Users, User, ChevronLeft, UsersRound, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Trophy, label: "Ligas", path: "/leagues" },
  { icon: BookOpen, label: "Conteúdo", path: "/content" },
  { icon: Users, label: "Comunidade", path: "/community" },
  { icon: UsersRound, label: "Squads", path: "/squads" },
  { icon: User, label: "Perfil", path: "/profile" },
];

export function DesktopSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <aside
      className={cn(
        "hidden md:flex fixed left-0 top-0 h-screen flex-col border-r border-border/50 bg-card/95 backdrop-blur-lg transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-6">
        {!collapsed && (
          <h2 className="text-xl font-bold text-primary text-glow">
            Respira Livre
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-primary/10"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/squads" && location.pathname.startsWith("/squads/"));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300",
                isActive
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300",
              location.pathname === "/admin"
                ? "bg-primary/10 text-primary glow-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium">Admin</span>
            )}
          </Link>
        )}
      </nav>
    </aside>
  );
}
