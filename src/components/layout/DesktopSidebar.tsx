import { Home, Trophy, BookOpen, Users, User, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Trophy, label: "Ligas", path: "/leagues" },
  { icon: BookOpen, label: "Conteúdo", path: "/content" },
  { icon: Users, label: "Comunidade", path: "/community" },
  { icon: User, label: "Perfil", path: "/profile" },
];

export function DesktopSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
          const isActive = location.pathname === item.path;
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
      </nav>
    </aside>
  );
}
