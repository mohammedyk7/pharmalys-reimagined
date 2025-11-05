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
import primalacImage from "@/assets/primalac-cma.png";
import { z } from "zod";

// Comprehensive validation schema for assessment form
const assessmentSchema = z.object({
  patient_name: z.string().trim().min(1, "Patient name is required").max(100, "Patient name must be less than 100 characters"),
  patient_gender: z.enum(['Male', 'Female'], { errorMap: () => ({ message: "Gender must be Male or Female" }) }),
  patient_age_months: z.number().int("Age must be a whole number").min(0, "Age cannot be negative").max(240, "Age must be less than 240 months (20 years)"),
  guardian_name: z.string().trim().min(1, "Guardian name is required").max(100, "Guardian name must be less than 100 characters"),
  guardian_phone: z.string().trim().regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, "Phone number must be valid (7-20 characters, numbers, spaces, dashes, parentheses allowed)"),
  clinician_name: z.string().trim().min(1, "Clinician name is required").max(100, "Clinician name must be less than 100 characters"),
  hospital_clinic: z.string().trim().min(1, "Hospital/clinic is required").max(200, "Hospital/clinic name must be less than 200 characters"),
  country: z.string().trim().max(100, "Country must be less than 100 characters").nullable(),
  city: z.string().trim().max(100, "City must be less than 100 characters").nullable(),
  crying_score: z.number().int("Score must be a whole number").min(0, "Score cannot be negative").max(6, "Crying score maximum is 6"),
  regurgitation_score: z.number().int("Score must be a whole number").min(0, "Score cannot be negative").max(6, "Regurgitation score maximum is 6"),
  stool_score: z.number().int("Score must be a whole number").min(0, "Score cannot be negative").max(6, "Stool score maximum is 6"),
  skin_score: z.number().int("Score must be a whole number").min(0, "Score cannot be negative").max(12, "Skin score maximum is 12"),
  respiratory_score: z.number().int("Score must be a whole number").min(0, "Score cannot be negative").max(3, "Respiratory score maximum is 3"),
  notes: z.string().trim().max(2000, "Notes must be less than 2000 characters").nullable(),
});

interface AssessmentFormProps {
  userId?: string;
}

const AssessmentForm = ({ userId }: AssessmentFormProps = {}) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const [skinHeadScore, setSkinHeadScore] = useState("0");
  const [skinArmsScore, setSkinArmsScore] = useState("0");
  const [urticariaPresent, setUrticariaPresent] = useState(false);
  const [respiratoryScore, setRespiratoryScore] = useState("0");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  const totalScore = parseInt(cryingScore) + parseInt(regurgitationScore) + 
                     parseInt(stoolScore) + parseInt(skinHeadScore) + parseInt(skinArmsScore) + parseInt(respiratoryScore);
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
    // Basic consent validation
    if (!consent) {
      toast.error("Please accept the consent form");
      return;
    }

    setSaving(true);

    try {
      // Get current authenticated user (optional)
      const { data: { user } } = await supabase.auth.getUser();

      // Prepare data for validation
      const formData = {
        patient_name: patientName,
        patient_gender: gender,
        patient_age_months: parseInt(age) || 0,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        clinician_name: clinicianName,
        hospital_clinic: hospital,
        country: country || null,
        city: city || null,
        crying_score: parseInt(cryingScore) || 0,
        regurgitation_score: parseInt(regurgitationScore) || 0,
        stool_score: parseInt(stoolScore) || 0,
        skin_score: (parseInt(skinHeadScore) || 0) + (parseInt(skinArmsScore) || 0),
        respiratory_score: parseInt(respiratoryScore) || 0,
        notes: notes || null,
      };

      // Validate using Zod schema
      const validatedData = assessmentSchema.parse(formData);

      // Prepare insert data with all required fields
      const insertData = {
        user_id: user?.id || null,
        assessment_date: date,
        patient_name: validatedData.patient_name,
        patient_gender: validatedData.patient_gender,
        patient_age_months: validatedData.patient_age_months,
        guardian_name: validatedData.guardian_name,
        guardian_phone: validatedData.guardian_phone,
        clinician_name: validatedData.clinician_name,
        hospital_clinic: validatedData.hospital_clinic,
        country: validatedData.country,
        city: validatedData.city,
        crying_score: validatedData.crying_score,
        regurgitation_score: validatedData.regurgitation_score,
        stool_score: validatedData.stool_score,
        skin_score: validatedData.skin_score,
        skin_head_neck_trunk_score: parseInt(skinHeadScore) || 0,
        skin_arms_hands_legs_feet_score: parseInt(skinArmsScore) || 0,
        urticaria_present: urticariaPresent,
        respiratory_score: validatedData.respiratory_score,
        notes: validatedData.notes,
      };
      
      const { data, error } = await supabase
        .from('assessments')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        toast.error(`Database error: ${error.message}`);
        setSaving(false);
        return;
      }

      setAssessmentId(data.id);
      setSaved(true);
      toast.success("Assessment saved successfully");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Display first validation error to user
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        console.error("Error saving assessment:", error);
        toast.error(error.message || "Failed to save assessment");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!saved) {
      toast.error("Please save the assessment first");
      return;
    }

    const totalScore = parseInt(cryingScore) + parseInt(regurgitationScore) + 
                      parseInt(stoolScore) + parseInt(skinHeadScore) + parseInt(skinArmsScore) + parseInt(respiratoryScore);

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
    doc.text(`Skin (Head/Neck/Trunk): ${skinHeadScore}`, 15, y);
    doc.text(`Skin (Arms/Hands/Legs/Feet): ${skinArmsScore}`, 70, y);
    y += 6;
    doc.text(`Respiratory: ${respiratoryScore}`, 15, y);
    
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
                  <p className="text-xs text-muted-foreground mb-2">Assessed by parents ≥ 1 week duration.</p>
                  <Select value={cryingScore} onValueChange={setCryingScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crying duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">≤ 1 hour per day (0)</SelectItem>
                      <SelectItem value="1">1 to 1.5 hours per day (1)</SelectItem>
                      <SelectItem value="2">1.5 to 2 hours per day (2)</SelectItem>
                      <SelectItem value="3">2 to 3 hours per day (3)</SelectItem>
                      <SelectItem value="4">3 to 4 hours per day (4)</SelectItem>
                      <SelectItem value="5">4 to 5 hours per day (5)</SelectItem>
                      <SelectItem value="6">≥ 5 hours per day (6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="regurgitation">Regurgitation</Label>
                  <p className="text-xs text-muted-foreground mb-2">≥ 1 week duration.</p>
                  <Select value={regurgitationScore} onValueChange={setRegurgitationScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select regurgitation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0–2 episodes per day (0)</SelectItem>
                      <SelectItem value="1">3 to 5 episodes per day (1)</SelectItem>
                      <SelectItem value="2">&gt; 5 episodes of &lt; 5 mL (2)</SelectItem>
                      <SelectItem value="3">&gt; 5 episodes of ½ feed in &lt; ½ feeds (3)</SelectItem>
                      <SelectItem value="4">Continuous regurgitation of small volumes &gt; 30 min after each feed (4)</SelectItem>
                      <SelectItem value="5">Regurgitation of half to complete volume of feed in latter half of feeds (5)</SelectItem>
                      <SelectItem value="6">Regurgitation of complete feed after each feeding (6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stool">Stools</Label>
                  <p className="text-xs text-muted-foreground mb-2">Brussels Infant and Toddlers Stool Scale (BITSS).</p>
                  <Select value={stoolScore} onValueChange={setStoolScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stool type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Formed stools (0)</SelectItem>
                      <SelectItem value="4">Hard or loose stools (4)</SelectItem>
                      <SelectItem value="6">Watery or bloody stools (6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Skin (Atopic Eczema)</Label>
                  <p className="text-xs text-muted-foreground mb-2">≥ 1 week duration.</p>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="skin-head" className="text-sm font-normal">Head/Neck/Trunk</Label>
                      <Select value={skinHeadScore} onValueChange={setSkinHeadScore}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Absent (0)</SelectItem>
                          <SelectItem value="2">Mild (2)</SelectItem>
                          <SelectItem value="4">Moderate (4)</SelectItem>
                          <SelectItem value="6">Severe (6)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="skin-arms" className="text-sm font-normal">Arms/Hands/Legs/Feet</Label>
                      <Select value={skinArmsScore} onValueChange={setSkinArmsScore}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Absent (0)</SelectItem>
                          <SelectItem value="2">Mild (2)</SelectItem>
                          <SelectItem value="4">Moderate (4)</SelectItem>
                          <SelectItem value="6">Severe (6)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="urticaria" 
                        checked={urticariaPresent}
                        onCheckedChange={(checked) => setUrticariaPresent(checked === true)}
                      />
                      <Label htmlFor="urticaria" className="text-sm font-normal cursor-pointer">
                        Urticaria present (+6)
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="respiratory">Respiratory Symptoms</Label>
                  <p className="text-xs text-muted-foreground mb-2">≥ 1 week duration.</p>
                  <Select value={respiratoryScore} onValueChange={setRespiratoryScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select respiratory symptoms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No respiratory symptoms (0)</SelectItem>
                      <SelectItem value="1">Slight symptoms (1)</SelectItem>
                      <SelectItem value="2">Mild symptoms (2)</SelectItem>
                      <SelectItem value="3">Severe symptoms (3)</SelectItem>
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
              
              {/* Product Recommendation */}
              {totalScore >= 10 && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3 text-center">Recommended Product</h4>
                  <div className="flex flex-col items-center gap-3">
                    <img 
                      src={primalacImage} 
                      alt="Primalac ULTIMA CMA" 
                      className="w-48 h-auto object-contain"
                    />
                    <p className="text-sm text-center text-muted-foreground">
                      For moderate to high CMPA scores, consider Primalac ULTIMA CMA (0-12 months)
                    </p>
                  </div>
                </div>
              )}
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
                <Button onClick={handleSave} disabled={saved || saving}>
                  {saving ? "Saving..." : saved ? "Saved ✓" : "Save Assessment"}
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
                    setSkinHeadScore("0");
                    setSkinArmsScore("0");
                    setUrticariaPresent(false);
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
