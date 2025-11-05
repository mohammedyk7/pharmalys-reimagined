import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Moon, Sun, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  user: any;
  onSignOut: () => void;
  showHomeButton?: boolean;
}

const Header = ({ user, onSignOut, showHomeButton = false }: HeaderProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      onSignOut();
    }
  };

  return (
    <header className="border-b border-border bg-card relative">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pharmalys Laboratories" className="h-24" />
        </div>
        <nav className="flex items-center gap-6">
          {user && (
            <>
              {showHomeButton && (
                <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </>
          )}
        </nav>
      </div>
      {/* Animated green line */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 via-green-400 to-green-500 w-full">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[slide-in-right_2s_ease-in-out_infinite]" />
      </div>
    </header>
  );
};

export default Header;
