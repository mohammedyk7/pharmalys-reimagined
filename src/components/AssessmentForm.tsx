import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import logo from "@/assets/logo.png";

interface AssessmentFormProps {
  userId: string;
}

const AssessmentForm = ({ userId }: AssessmentFormProps) => {
  const [saved, setSaved] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  
  // Form state
  const [patientName, setPatientName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [clinicianName, setClinicianName] = useState("");
  const [hospital, setHospital] = useState("");
  const [location, setLocation] = useState("");
  const [cryingScore, setCryingScore] = useState("0");
  const [regurgitationScore, setRegurgitationScore] = useState("0");
  const [stoolScore, setStoolScore] = useState("0");
  const [skinScore, setSkinScore] = useState("0");
  const [respiratoryScore, setRespiratoryScore] = useState("0");

  const handleSave = async () => {
    // Validation
    if (!patientName || !gender || !age || !guardianName || !guardianPhone || 
        !clinicianName || !hospital) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          patient_name: patientName,
          patient_gender: gender,
          patient_age_months: parseInt(age),
          assessment_date: date,
          guardian_name: guardianName,
          guardian_phone: guardianPhone,
          clinician_name: clinicianName,
          hospital_clinic: hospital,
          location: location || null,
          crying_score: parseInt(cryingScore),
          regurgitation_score: parseInt(regurgitationScore),
          stool_score: parseInt(stoolScore),
          skin_score: parseInt(skinScore),
          respiratory_score: parseInt(respiratoryScore),
        })
        .select()
        .single();

      if (error) throw error;

      setAssessmentId(data.id);
      setSaved(true);
      toast.success("Assessment saved successfully");
    } catch (error: any) {
      console.error("Error saving assessment:", error);
      toast.error(error.message || "Failed to save assessment");
    }
  };

  const handleExport = () => {
    if (!saved) {
      toast.error("Please save the assessment first");
      return;
    }

    const totalScore = parseInt(cryingScore) + parseInt(regurgitationScore) + 
                      parseInt(stoolScore) + parseInt(skinScore) + parseInt(respiratoryScore);

    const doc = new jsPDF();
    
    // Add logo
    const imgData = logo;
    doc.addImage(imgData, 'PNG', 15, 10, 50, 15);
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 113, 188); // Pharmalys blue
    doc.text('CoMiSS Assessment Report', 105, 35, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Patient Details
    let y = 50;
    doc.setFontSize(14);
    doc.text('Patient Details', 15, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Name: ${patientName}`, 15, y);
    doc.text(`Gender: ${gender}`, 120, y);
    y += 6;
    doc.text(`Age: ${age} months`, 15, y);
    doc.text(`Date: ${date}`, 120, y);
    y += 6;
    doc.text(`Guardian: ${guardianName}`, 15, y);
    doc.text(`Phone: ${guardianPhone}`, 120, y);
    
    // Clinician Details
    y += 12;
    doc.setFontSize(14);
    doc.text('Clinician Details', 15, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Clinician: ${clinicianName}`, 15, y);
    y += 6;
    doc.text(`Hospital/Clinic: ${hospital}`, 15, y);
    if (location) {
      y += 6;
      doc.text(`Location: ${location}`, 15, y);
    }
    
    // CoMiSS Scores
    y += 12;
    doc.setFontSize(14);
    doc.text('CoMiSS Scores', 15, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Crying: ${cryingScore}`, 15, y);
    doc.text(`Regurgitation: ${regurgitationScore}`, 70, y);
    doc.text(`Stool: ${stoolScore}`, 125, y);
    y += 6;
    doc.text(`Skin: ${skinScore}`, 15, y);
    doc.text(`Respiratory: ${respiratoryScore}`, 70, y);
    
    // Total Score
    y += 12;
    doc.setFontSize(16);
    doc.setTextColor(130, 183, 37); // Pharmalys green
    doc.text(`Total Score: ${totalScore}`, 15, y);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('© Pharmalys Laboratories - Confidential', 105, 280, { align: 'center' });
    
    // Save PDF
    doc.save(`CoMiSS_Assessment_${patientName.replace(/\s+/g, '_')}_${date}.pdf`);
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
                  <Input 
                    id="name" 
                    placeholder="Patient name" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Age (months) *</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    placeholder="0" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Use exact months (round to nearest if needed).</p>
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Defaults to today.</p>
                </div>
                <div>
                  <Label htmlFor="guardian">Guardian name *</Label>
                  <Input 
                    id="guardian" 
                    placeholder="Guardian name" 
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Guardian phone *</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 234 567 8900" 
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                  />
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
                  <Input 
                    id="clinician" 
                    placeholder="Full name" 
                    value={clinicianName}
                    onChange={(e) => setClinicianName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Full name as it will appear on the report.</p>
                </div>
                <div>
                  <Label htmlFor="hospital">Hospital / Clinic *</Label>
                  <Input 
                    id="hospital" 
                    placeholder="Hospital name" 
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="City, country (optional)" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
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
                  <Select value={cryingScore} onValueChange={setCryingScore}>
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
                  <Select value={regurgitationScore} onValueChange={setRegurgitationScore}>
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
                  <Select value={stoolScore} onValueChange={setStoolScore}>
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
                  <Select value={skinScore} onValueChange={setSkinScore}>
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
                  <Select value={respiratoryScore} onValueChange={setRespiratoryScore}>
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setPatientName("");
                  setGender("");
                  setAge("");
                  setDate(new Date().toISOString().split('T')[0]);
                  setGuardianName("");
                  setGuardianPhone("");
                  setClinicianName("");
                  setHospital("");
                  setLocation("");
                  setCryingScore("0");
                  setRegurgitationScore("0");
                  setStoolScore("0");
                  setSkinScore("0");
                  setRespiratoryScore("0");
                  setSaved(false);
                  setAssessmentId(null);
                  toast.info("Form cleared");
                }}
              >
                Clear Form
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={saved}>
                {saved ? "Saved ✓" : "Save Assessment"}
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
