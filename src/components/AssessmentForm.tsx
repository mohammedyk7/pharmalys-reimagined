import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import logo from "@/assets/logo.png";

interface AssessmentFormProps {
  userId?: string;
}

const AssessmentForm = ({ userId }: AssessmentFormProps = {}) => {
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
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [cryingScore, setCryingScore] = useState("0");
  const [regurgitationScore, setRegurgitationScore] = useState("0");
  const [stoolScore, setStoolScore] = useState("0");
  const [skinScore, setSkinScore] = useState("0");
  const [respiratoryScore, setRespiratoryScore] = useState("0");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  const totalScore = parseInt(cryingScore) + parseInt(regurgitationScore) + 
                     parseInt(stoolScore) + parseInt(skinScore) + parseInt(respiratoryScore);
  const maxScore = 33;

  const getAnalysis = () => {
    if (totalScore <= 10) {
      return { text: "Low likelihood of CMPA", recommendation: "Continue monitoring" };
    } else if (totalScore <= 15) {
      return { text: "Moderate likelihood of CMPA", recommendation: "Consider dietary changes" };
    } else {
      return { text: "High likelihood of CMPA", recommendation: "Consider referral" };
    }
  };

  const analysis = getAnalysis();

  // Countries list
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
    "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
    "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
    "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
    "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  // Omani governorates
  const omaniGovernorates = [
    "Muscat", "Dhofar", "Musandam", "Al Buraimi", "Ad Dakhiliyah", "Ad Dhahirah", 
    "Ash Sharqiyah North", "Ash Sharqiyah South", "Al Batinah North", "Al Batinah South", "Al Wusta"
  ];

  const handleSave = async () => {
    console.log("Save button clicked");
    console.log("Consent status:", consent);
    
    // Validation - only gender and age are required for patient details
    if (!gender || !age) {
      toast.error("Please fill in all required fields (Gender and Age)");
      return;
    }
    
    // Validate that all symptoms have been assessed (not default/empty)
    // Since they all default to "0", we just need to ensure they exist
    if (cryingScore === "" || regurgitationScore === "" || stoolScore === "" || 
        skinScore === "" || respiratoryScore === "") {
      toast.error("Please assess all symptoms");
      return;
    }

    if (!consent) {
      console.log("Consent validation failed");
      toast.error("Please accept the consent form");
      return;
    }

    console.log("Validation passed, attempting to save...");

    try {
      const insertData = {
        user_id: userId || null,
        patient_name: patientName,
        patient_gender: gender,
        patient_age_months: parseInt(age),
        assessment_date: date,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        clinician_name: clinicianName,
        hospital_clinic: hospital,
        country: country || null,
        city: city || null,
        crying_score: parseInt(cryingScore),
        regurgitation_score: parseInt(regurgitationScore),
        stool_score: parseInt(stoolScore),
        skin_score: parseInt(skinScore),
        respiratory_score: parseInt(respiratoryScore),
        notes: notes || null,
      };
      
      console.log("Insert data:", insertData);
      
      const { data, error } = await supabase
        .from('assessments')
        .insert(insertData)
        .select()
        .single();

      console.log("Database response - data:", data, "error:", error);

      if (error) {
        console.error("Supabase error:", error);
        toast.error(`Database error: ${error.message}`);
        return;
      }

      console.log("Save successful:", data);
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
    if (country) {
      y += 6;
      doc.text(`Country: ${country}`, 15, y);
    }
    if (city) {
      y += 6;
      doc.text(`City: ${city}`, 15, y);
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
              <p className="text-sm text-muted-foreground mb-4">Required fields marked with *</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
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
                  <Label htmlFor="guardian">Guardian name</Label>
                  <Input 
                    id="guardian" 
                    placeholder="Guardian name" 
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Guardian phone</Label>
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
              <p className="text-sm text-muted-foreground mb-4">Optional information</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinician">Clinician&apos;s Name</Label>
                  <Input 
                    id="clinician" 
                    placeholder="Full name" 
                    value={clinicianName}
                    onChange={(e) => setClinicianName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Full name as it will appear on the report.</p>
                </div>
                <div>
                  <Label htmlFor="hospital">Hospital / Clinic</Label>
                  <Input 
                    id="hospital" 
                    placeholder="Hospital name" 
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={(value) => {
                    setCountry(value);
                    if (value !== "Oman") {
                      setCity("");
                    }
                  }}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-[300px]">
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City / Governorate</Label>
                  <Select 
                    value={city} 
                    onValueChange={setCity}
                    disabled={country !== "Oman"}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder={country === "Oman" ? "Select governorate" : "Select Oman first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {omaniGovernorates.map((gov) => (
                        <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {country === "Oman" ? "Select your governorate" : "Only available when Oman is selected"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Symptoms */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Symptoms *</h3>
              <p className="text-sm text-muted-foreground mb-4">All symptoms must be assessed - Assessed by parents without any obvious cause (≥1 week duration, no infectious disease)</p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="crying">Crying</Label>
                  <p className="text-xs text-muted-foreground mb-2">Assessed by parents • ≥ 1 week duration</p>
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
                  <p className="text-xs text-muted-foreground mb-2">≥ 1 week duration</p>
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
                  <p className="text-xs text-muted-foreground mb-2">Brussels Infant and Toddlers Stool Scale (BITSS)</p>
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
                  <Label htmlFor="skin">Skin (Atopic Eczema)</Label>
                  <p className="text-xs text-muted-foreground mb-2">≥ 1 week duration</p>
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
                  <p className="text-xs text-muted-foreground mb-2">≥ 1 week duration</p>
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

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <Textarea 
                placeholder="Extra comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Analysis Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{totalScore} / {maxScore}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {analysis.text} — {gender || "Patient"}
                  </span>
                </div>
              </div>
              <Progress value={(totalScore / maxScore) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3">
              <Checkbox 
                id="consent" 
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
              />
              <label 
                htmlFor="consent" 
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                I consent to the collection and secure storage of the information entered in this form for the purpose of scientific research. I understand that this information will be used only for clinical assessment and will not be shared with third parties without the guardian&apos;s explicit permission, except where required by law.
              </label>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-between flex-wrap items-center">
              <div className="text-sm font-medium">
                Total: {totalScore}
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={saved}>
                  {saved ? "Saved ✓" : "Save Assessment"}
                </Button>
                <Button 
                  onClick={handleExport}
                  disabled={!saved}
                  variant="outline"
                >
                  Export PDF
                </Button>
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
                    setCountry("");
                    setCity("");
                    setCryingScore("0");
                    setRegurgitationScore("0");
                    setStoolScore("0");
                    setSkinScore("0");
                    setRespiratoryScore("0");
                    setNotes("");
                    setConsent(false);
                    setSaved(false);
                    setAssessmentId(null);
                    toast.info("Form cleared");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AssessmentForm;
