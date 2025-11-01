import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-secondary">
          Evaluate. Score. Share.
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          Your CoMiSS® Digital Tool
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Developed by Pharmalys Laboratories to simplify CoMiSS® assessments and reporting
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
