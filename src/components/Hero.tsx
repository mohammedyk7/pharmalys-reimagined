import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Main content */}
          <div className="text-center md:text-left">
            <Badge variant="secondary" className="mb-6">
              New • CoMiSS PDF v2
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Build and export <span className="text-secondary">clinical-grade</span> CoMiSS reports.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Streamlined infant symptom assessment: consistent scoring, clear interpretation, secure export.
            </p>
            <div className="flex gap-4 justify-center md:justify-start flex-wrap">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <a href="#app">Start Assessing</a>
              </Button>
              <Button size="lg" variant="secondary">View PDF Sample</Button>
            </div>
          </div>

          {/* Right side - Tagline */}
          <div className="text-center md:text-right space-y-4">
            <div>
              <p className="text-2xl md:text-3xl font-semibold text-primary mb-2">
                Evaluate. Score. Share.
              </p>
              <p className="text-3xl md:text-4xl font-bold text-secondary">
                Your CoMiSS® Digital Tool
              </p>
            </div>
            <p className="text-sm text-muted-foreground max-w-md ml-auto">
              Developed by Pharmalys Laboratories to simplify CoMiSS® assessments and reporting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
