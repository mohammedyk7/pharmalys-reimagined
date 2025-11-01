import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <Badge variant="secondary" className="mb-6">
          New • CoMiSS PDF v2
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Build and export <span className="text-secondary">clinical-grade</span> CoMiSS reports.
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Streamlined infant symptom assessment: consistent scoring, clear interpretation, secure export.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <a href="#app">Start Assessing</a>
          </Button>
          <Button size="lg" variant="secondary">View PDF Sample</Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
