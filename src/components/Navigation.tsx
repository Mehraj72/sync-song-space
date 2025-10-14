import { Home, Library, ListMusic, User, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navigation = ({ role = "user" }) => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Library, label: "Library", path: "/library" },
    { icon: ListMusic, label: "Playlists", path: "/playlists" },
    { icon: User, label: "Profile", path: "/profile" },
  ];
  if (role === "admin") {
    navItems.push({ icon: Shield, label: "Admin", path: "/admin" });
  }
  return (
    <nav className="fixed left-0 top-0 h-screen w-20 lg:w-64 glass-effect border-r border-border z-50">
      <div className="flex flex-col h-full p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent hidden lg:block">
            VibeStream
          </h1>
          <div className="lg:hidden text-2xl">🎵</div>
        </div>
        <div className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg transition-smooth",
                  "hover:bg-primary/10",
                  isActive && "bg-primary/20 text-primary glow-effect"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
