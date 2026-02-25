import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, BrainCircuit, Trophy, LogOut, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return <>{children}</>;

  const navItems = [
    { href: "/dashboard", label: "Quizzes", icon: CheckSquare, show: true },
    { href: "/admin", label: "Admin Panel", icon: LayoutDashboard, show: user.role === "admin" },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy, show: true },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/30 flex flex-col backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <BrainCircuit className="w-6 h-6 text-primary mr-3" />
          <span className="font-display font-bold text-xl tracking-wide text-gradient">
            NeuroHire
          </span>
        </div>
        
        <div className="p-4 flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-2 px-2">
            Menu
          </div>
          {navItems.filter(i => i.show).map((item) => (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
              location === item.href || location.startsWith(item.href + '/')
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}>
              <item.icon className={cn("w-5 h-5 mr-3 transition-transform duration-200", location === item.href ? "scale-110" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-border/50">
          <div className="px-4 py-3 bg-secondary/50 rounded-xl mb-4 border border-border/30">
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{user.role}</p>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 p-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
