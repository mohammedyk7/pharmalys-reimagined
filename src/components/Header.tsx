import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface HeaderProps {
  user: any;
  onSignOut: () => void;
}

const Header = ({ user, onSignOut }: HeaderProps) => {
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
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pharmalys Laboratories" className="h-16" />
        </div>
        <nav className="flex items-center gap-6">
          <a href="#company" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Company
          </a>
          <a href="#quality" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Quality
          </a>
          <a href="#sustainability" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Sustainability
          </a>
          <a href="#brands" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Brands
          </a>
          {user && (
            <>
              <span className="text-sm text-muted-foreground hidden md:block">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
