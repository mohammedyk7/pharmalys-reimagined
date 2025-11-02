import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div id="reference" className="mb-6 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => window.open('https://doi.org/10.3390/nu14132683', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Reference: Vandenplas Y, et al. The Cow's Milk Related Symptom Score: The 2022 Update. Nutrients. 2022; 14(13):2683
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
          CoMiSS®️ (Cow's Milk-related Symptom Score) is a registered trademark of its respective owner. 
          This digital tool is independently developed by Pharmalys Laboratories to facilitate the use of the publicly available CoMiSS®️ scoring system. 
          Pharmalys Laboratories is not affiliated with, endorsed by, or representing the trademark owner.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
