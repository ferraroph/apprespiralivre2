import { Home, Trophy, BookOpen, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Trophy, label: "Ligas", path: "/leagues" },
  { icon: BookOpen, label: "Conteúdo", path: "/content" },
  { icon: Users, label: "Comunidade", path: "/community" },
  { icon: User, label: "Perfil", path: "/profile" },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
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
