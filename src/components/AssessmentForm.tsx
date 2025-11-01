import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const AssessmentForm = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Assessment saved successfully");
  };

  const handleExport = () => {
    if (!saved) {
      toast.error("Please save the assessment first");
      return;
    }
    toast.success("PDF exported successfully");
  };

  return (
    <section id="app" className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">CoMiSS Assessment</CardTitle>
            <CardDescription>Fill the form and click <strong>Save</strong> to enable <strong>Export PDF</strong>.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Patient Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient Details</h3>
              <p className="text-sm text-muted-foreground mb-4">Required fields marked *</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="Patient name" />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Age (months) *</Label>
                  <Input id="age" type="number" placeholder="0" />
                  <p className="text-xs text-muted-foreground mt-1">Use exact months (round to nearest if needed).</p>
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" />
                  <p className="text-xs text-muted-foreground mt-1">Defaults to today.</p>
                </div>
                <div>
                  <Label htmlFor="guardian">Guardian name *</Label>
                  <Input id="guardian" placeholder="Guardian name" />
                </div>
                <div>
                  <Label htmlFor="phone">Guardian phone *</Label>
                  <Input id="phone" type="tel" placeholder="+1 234 567 8900" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Clinician Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Clinician Details</h3>
              <p className="text-sm text-muted-foreground mb-4">Required fields marked *</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinician">Clinician's Name *</Label>
                  <Input id="clinician" placeholder="Full name" />
                  <p className="text-xs text-muted-foreground mt-1">Full name as it will appear on the report.</p>
                </div>
                <div>
                  <Label htmlFor="hospital">Hospital / Clinic *</Label>
                  <Input id="hospital" placeholder="Hospital name" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" placeholder="City, country" />
                  <p className="text-xs text-muted-foreground mt-1">City, country (optional).</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Symptoms */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Symptoms (CoMiSS)</h3>
              <p className="text-sm text-muted-foreground mb-4">Assessed ≥1 week • No infectious disease</p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="crying">Crying (≥1 week)</Label>
                  <p className="text-xs text-muted-foreground mb-2">Assessed by parents • ≥1 week</p>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="≤ 1 h/day (0)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">≤ 1 h/day (0)</SelectItem>
                      <SelectItem value="1">1–1.5 h/day (1)</SelectItem>
                      <SelectItem value="2">1.5–2 h/day (2)</SelectItem>
                      <SelectItem value="3">2–3 h/day (3)</SelectItem>
                      <SelectItem value="4">3–4 h/day (4)</SelectItem>
                      <SelectItem value="5">4–5 h/day (5)</SelectItem>
                      <SelectItem value="6">≥ 5 h/day (6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="regurgitation">Regurgitation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="None/rare (0)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None/rare (0)</SelectItem>
                      <SelectItem value="1">Mild (1)</SelectItem>
                      <SelectItem value="2">Occasional (2)</SelectItem>
                      <SelectItem value="3">Frequent (3)</SelectItem>
                      <SelectItem value="4">Marked (4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stool">Stools</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Normal (0)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal (0)</SelectItem>
                      <SelectItem value="1">Soft (1)</SelectItem>
                      <SelectItem value="2">Loose (2)</SelectItem>
                      <SelectItem value="3">Watery (3)</SelectItem>
                      <SelectItem value="4">Bloody (4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="skin">Skin Symptoms</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="None (0)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None (0)</SelectItem>
                      <SelectItem value="1">Mild (1)</SelectItem>
                      <SelectItem value="2">Moderate (2)</SelectItem>
                      <SelectItem value="3">Severe (3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="respiratory">Respiratory Symptoms</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="None (0)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None (0)</SelectItem>
                      <SelectItem value="1">Mild (1)</SelectItem>
                      <SelectItem value="2">Moderate (2)</SelectItem>
                      <SelectItem value="3">Severe (3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end flex-wrap">
              <Button variant="outline" onClick={() => toast.info("Form cleared")}>
                Clear Form
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                Save Assessment
              </Button>
              <Button 
                onClick={handleExport}
                disabled={!saved}
                className="bg-secondary hover:bg-secondary/90"
              >
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AssessmentForm;
