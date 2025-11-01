import { CheckCircle2, Shield, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: CheckCircle2,
      title: "Clinical Reliability",
      description: "Validated scoring aligned with pediatric guidelines to support consistent diagnosis and monitoring in clinical practice."
    },
    {
      icon: Shield,
      title: "Brand Integrity",
      description: "Pharmalys branding and copyright automatically included, ensuring trust and authenticity in every report."
    },
    {
      icon: Lock,
      title: "Safe → Controlled Workflow",
      description: "Reports can only be exported after saving, reducing errors and protecting clinical data integrity."
    }
  ];

  return (
    <section id="features" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
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
      </div>
    </section>
  );
};

export default Features;
