import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Moon, Sun, Home, Mail, Info, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PublicHeader = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    
    // Check auth status
    checkAuthStatus();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthStatus();
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
    
    if (user) {
      // Check if user is admin
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!data);
    } else {
      setIsAdmin(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-card relative">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pharmalys Laboratories" className="h-24" />
          <span className="px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-md border border-primary/20">
            DEMO
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = "#app"}>
            <Info className="h-4 w-4 mr-2" />
            About
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/contact")}>
            <Mail className="h-4 w-4 mr-2" />
            Contact Us
          </Button>
          {isAdmin && (
            <span className="px-3 py-1 text-sm font-semibold bg-primary text-primary-foreground rounded-md">
              Admin
            </span>
          )}
          {isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
              Admin Login
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
      {/* Animated green line */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 via-green-400 to-green-500 w-full">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[slide-in-right_2s_ease-in-out_infinite]" />
      </div>
    </header>
  );
};

export default PublicHeader;
