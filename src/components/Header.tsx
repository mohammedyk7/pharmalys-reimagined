import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  user: any;
  onSignOut: () => void;
}

const Header = ({ user, onSignOut }: HeaderProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
    <header className="border-b border-white/10 bg-black/30 backdrop-blur-sm absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pharmalys Laboratories" className="h-20" />
        </div>
        <nav className="flex items-center gap-6">
          <a href="#features" className="text-sm text-white/80 hover:text-white transition-colors">
            Features
          </a>
          <a href="#app" className="text-sm text-white/80 hover:text-white transition-colors">
            App
          </a>
          {user && (
            <>
              <span className="text-sm text-white/80">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="border-white/20 text-white hover:bg-white/10">
                Sign out
              </Button>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="border-white/20 text-white hover:bg-white/10">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
