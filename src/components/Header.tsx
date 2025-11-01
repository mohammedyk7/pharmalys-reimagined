import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pharmalys Laboratories" className="h-10" />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            App
          </a>
          <Button variant="outline" size="sm">Sign In</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">Toggle Theme</Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
