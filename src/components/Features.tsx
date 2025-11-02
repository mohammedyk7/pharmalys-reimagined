import { Award, Shield, Workflow, Heart, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Features = () => {
  const features = [
    {
      icon: Award,
      title: "Evidence-Based Scoring",
      description: "Aligned with validated pediatric criteria and the latest CoMiSS® update from ESPGHAN (2022), ensuring every assessment reflects current best practices and clinical relevance."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Data is saved before export, minimizing errors and supporting compliance with privacy and clinical documentation standards."
    },
    {
      icon: Workflow,
      title: "Seamless Integration",
      description: "Designed for real-world use: from outpatient clinics to research settings, with export-ready reports that fit into existing workflows."
    },
    {
      icon: Heart,
      title: "Patient-Centered Clarity",
      description: "Designed to support caregiver understanding and pediatric decision-making, bridging clinical insight with everyday relevance."
    }
  ];

  return (
    <section id="reference" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
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
      </div>
    </section>
  );
};

export default Features;
