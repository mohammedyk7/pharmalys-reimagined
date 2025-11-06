import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";

const Hero = memo(() => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight text-secondary">
          Evaluate. Score. Share.
        </h1>
        <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight">
          Your CoMiSS® Digital Tool
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
          Developed by Pharmalys Laboratories to simplify CoMiSS® assessments and reporting
        </p>
        <div className="flex gap-3 md:gap-4 justify-center flex-wrap px-4">
          <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <a href="#app">Start Assessing</a>
          </Button>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">View PDF Sample</Button>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
