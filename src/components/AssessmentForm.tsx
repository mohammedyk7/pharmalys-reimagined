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
  const [cryingScore, setCryingScore] = useState("");
  const [regurgitationScore, setRegurgitationScore] = useState("");
  const [stoolScore, setStoolScore] = useState("");
  const [skinHeadScore, setSkinHeadScore] = useState("");
  const [skinArmsScore, setSkinArmsScore] = useState("");
  const [urticariaPresent, setUrticariaPresent] = useState(false);
  const [respiratoryScore, setRespiratoryScore] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  const totalScore = (parseInt(cryingScore) || 0) + (parseInt(regurgitationScore) || 0) + 
                     (parseInt(stoolScore) || 0) + (parseInt(skinHeadScore) || 0) + (parseInt(skinArmsScore) || 0) + (parseInt(respiratoryScore) || 0);
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

    // Validate all required symptom fields are selected
    if (!cryingScore || !regurgitationScore || !stoolScore || !skinHeadScore || !skinArmsScore || !respiratoryScore) {
      toast.error("Please select all symptom scores before saving");
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
        crying_score: parseInt(cryingScore),
        regurgitation_score: parseInt(regurgitationScore),
        stool_score: parseInt(stoolScore),
        skin_score: parseInt(skinHeadScore) + parseInt(skinArmsScore),
        respiratory_score: parseInt(respiratoryScore),
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

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      compress: true
    });
    
    // Set default font
    doc.setFont('helvetica');
    
    // Add logo
    const imgData = logo;
    doc.addImage(imgData, 'PNG', 45, 30, 90, 72);
    
    // Title - centered, blue
    doc.setFontSize(18);
    doc.setTextColor(0, 113, 188);
    doc.setFont('helvetica', 'bold');
    doc.text('CoMiSS: Cow\'s Milk-related Symptom Score', 297.5, 90, { align: 'center' });
    
    // Purpose box - right side
    doc.setFontSize(9);
    doc.setTextColor(200, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('Purpose:', 380, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    const purposeText = 'CoMiSS is a simple, fast, and easy-to-use awareness tool for cow\'s milk-related symptoms. It increases awareness of the most common symptoms of cow\'s milk allergy (CMA). CoMiSS can also be used to evaluate and quantify the evolution of symptoms during the therapeutic intervention. CoMiSS is intended to be used in children from 0 to 24 months.';
    const purposeLines = doc.splitTextToSize(purposeText, 170);
    doc.text(purposeLines, 380, 55);
    
    // Disclaimer box - right side
    doc.setFontSize(9);
    doc.setTextColor(200, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('Disclaimer:', 380, 115);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    const disclaimerText = 'This tool is not intended for infants with severe and life-threatening symptoms clearly indicating CMA, including anaphylaxis, which requires urgent referral. Infants presenting with failure to thrive and sick infants with hematochezia require urgent referral and full diagnostic work up.';
    const disclaimerLines = doc.splitTextToSize(disclaimerText, 170);
    doc.text(disclaimerLines, 380, 125);
    
    // Patient Details Section
    let y = 195;
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Details', 45, y);
    
    y += 5;
    doc.setLineWidth(1.5);
    doc.line(45, y, 550, y);
    
    y += 18;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${patientName}`, 45, y);
    doc.text(`Gender: ${gender}`, 340, y);
    
    y += 18;
    doc.text(`Age: ${age} months`, 45, y);
    doc.text(`Date: ${date}`, 340, y);
    
    y += 18;
    doc.text(`Guardian: ${guardianName}`, 45, y);
    doc.text(`Phone: ${guardianPhone}`, 340, y);
    
    // Clinician Details Section
    y += 30;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinician Details', 45, y);
    
    y += 5;
    doc.line(45, y, 550, y);
    
    y += 18;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Clinician: ${clinicianName}`, 45, y);
    
    y += 18;
    doc.text(`Hospital/Clinic: ${hospital}`, 45, y);
    
    if (country) {
      y += 18;
      doc.text(`Country: ${country}`, 45, y);
    }
    
    if (city) {
      y += 18;
      doc.text(`City: ${city}`, 45, y);
    }
    
    // Helper functions for symptom descriptions
    const getCryingDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        '0': 'Less than or equal to 1 hour per day',
        '1': '1 to 1.5 hours per day',
        '2': '1.5 to 2 hours per day',
        '3': '2 to 3 hours per day',
        '4': '3 to 4 hours per day',
        '5': '4 to 5 hours per day',
        '6': 'Greater than or equal to 5 hours per day'
      };
      return descriptions[score] || '';
    };
    
    const getRegurgitationDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        '0': '0-2 episodes of small volumes per day',
        '1': 'Greater than or equal to 3 episodes of small volumes per day',
        '2': 'Greater than or equal to 3 episodes of >half feed in <half feeds',
        '3': 'Greater than or equal to 3 episodes of >half feed in >half feeds'
      };
      return descriptions[score] || '';
    };
    
    const getStoolDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        '0': 'Normal stool (Type 1, 4)',
        '3': 'Abnormal stool (Type 2, 3)',
        '6': 'Abnormal stool (Type 5, 6)'
      };
      return descriptions[score] || '';
    };
    
    const getSkinDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        '0': 'Absent',
        '2': 'Mild',
        '4': 'Moderate',
        '6': 'Severe'
      };
      return descriptions[score] || '';
    };
    
    const getRespiratoryDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        '0': 'No respiratory symptoms',
        '1': 'Slight symptoms',
        '2': 'Mild symptoms',
        '3': 'Severe symptoms'
      };
      return descriptions[score] || '';
    };
    
    // Symptoms Section
    y += 30;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Symptoms', 45, y);
    
    y += 5;
    doc.line(45, y, 550, y);
    
    y += 18;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Crying: ${getCryingDesc(cryingScore)}`, 45, y);
    
    y += 18;
    doc.text(`Regurgitation: ${getRegurgitationDesc(regurgitationScore)}`, 45, y);
    
    y += 18;
    doc.text(`Stool: ${getStoolDesc(stoolScore)}`, 45, y);
    
    y += 18;
    doc.text(`Skin (Head/Neck/Trunk): ${getSkinDesc(skinHeadScore)}`, 45, y);
    
    y += 18;
    doc.text(`Skin (Arms/Hands/Legs/Feet): ${getSkinDesc(skinArmsScore)}`, 45, y);
    
    y += 18;
    doc.text(`Respiratory: ${getRespiratoryDesc(respiratoryScore)}`, 45, y);
    
    // Score Section
    y += 30;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Score: ${totalScore}`, 45, y);
    doc.setFont('helvetica', 'normal');
    
    y += 20;
    doc.setFontSize(10);
    let interpretation = '';
    if (totalScore < 6) {
      interpretation = 'Symptoms are not likely to be related to CMA. Look for other causes.';
    } else if (totalScore >= 6 && totalScore <= 9) {
      interpretation = 'More investigation is needed.';
    } else {
      interpretation = 'May be suggestive of cow\'s milk-related symptoms and could potentially be CMA.';
    }
    const interpretationLines = doc.splitTextToSize(interpretation, 500);
    doc.text(interpretationLines, 45, y);
    
    y += (interpretationLines.length * 14) + 15;
    
    // Interpretation guide (small text)
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Interpretation:', 45, y);
    doc.setFont('helvetica', 'normal');
    
    y += 12;
    doc.text('(Total score greater than or equal to 10) May be suggestive of cow\'s milk-related symptoms', 45, y);
    
    y += 10;
    doc.text('and could potentially be CMA.', 45, y);
    
    y += 12;
    doc.text('(Total score less than 6) Symptoms are not likely to be related to CMA. Look for other causes.', 45, y);
    
    doc.setTextColor(0, 0, 0);
    
    // Product Recommendation (only for scores >= 10)
    if (totalScore >= 10) {
      y += 40;
      doc.setFontSize(14);
      doc.setTextColor(0, 113, 188);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommended Product', 297.5, y, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      
      y += 20;
      doc.addImage(primalacImage, 'PNG', 210, y, 175, 175);
      
      y += 185;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('For moderate to high CMPA scores, consider Primalac ULTIMA CMA (0-12 months)', 297.5, y, { align: 'center' });
    }
    
    // Bottom disclaimer
    const pageHeight = doc.internal.pageSize.height;
    y = pageHeight - 90;
    doc.setFontSize(8);
    doc.setTextColor(200, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('Disclaimer:', 45, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    y += 10;
    const bottomDisclaimer = 'CoMiSS scoring form is not intended to be used as a diagnostic tool and should not replace an oral food challenge. CMA diagnosis should be confirmed by a 2 to 4 week elimination diet followed by an oral food challenge.';
    const bottomLines1 = doc.splitTextToSize(bottomDisclaimer, 500);
    doc.text(bottomLines1, 45, y);
    
    y += (bottomLines1.length * 10) + 5;
    const bottomDisclaimer2 = 'Worsening of eczema might be indicative of CMA. If urticaria/angioedema can be directly related to cow\'s milk (e.g., drinking milk in the absence of other food), this is strongly suggestive of CMA.';
    const bottomLines2 = doc.splitTextToSize(bottomDisclaimer2, 500);
    doc.text(bottomLines2, 45, y);
    
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
                  <Select value={cryingScore || undefined} onValueChange={setCryingScore}>
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
                  <Select value={regurgitationScore || undefined} onValueChange={setRegurgitationScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select regurgitation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0–2 episodes of small volumes per day (0)</SelectItem>
                      <SelectItem value="1">≥ 3 episodes of small volumes per day (1)</SelectItem>
                      <SelectItem value="2">≥ 3 episodes of &gt; half of the feed volume in &lt; half of feeds (2)</SelectItem>
                      <SelectItem value="3">≥ 3 episodes of &gt; half of the feed volume in ≥ half of feeds (3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stool">Stools</Label>
                  <p className="text-xs text-muted-foreground mb-2">Brussels Infant and Toddlers Stool Scale (BITSS).</p>
                  <Select value={stoolScore || undefined} onValueChange={setStoolScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stool type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Type 1 and 4 (0)</SelectItem>
                      <SelectItem value="3">Type 2 and 3 (3)</SelectItem>
                      <SelectItem value="6">Type 5 and 6 (6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Skin (Atopic Eczema)</Label>
                  <p className="text-xs text-muted-foreground mb-2">≥ 1 week duration.</p>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="skin-head" className="text-sm font-normal">Head/Neck/Trunk</Label>
                      <Select value={skinHeadScore || undefined} onValueChange={setSkinHeadScore}>
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
                      <Select value={skinArmsScore || undefined} onValueChange={setSkinArmsScore}>
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
                  <Select value={respiratoryScore || undefined} onValueChange={setRespiratoryScore}>
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
