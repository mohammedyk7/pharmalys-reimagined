import { useState, useEffect } from "react";
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
  patient_name: z
    .string()
    .trim()
    .min(1, "Patient name is required")
    .max(100, "Patient name must be less than 100 characters"),
  patient_gender: z.enum(["Male", "Female"], { errorMap: () => ({ message: "Gender must be Male or Female" }) }),
  patient_age_months: z
    .number()
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(240, "Age must be less than 240 months (20 years)"),
  guardian_name: z
    .string()
    .trim()
    .min(1, "Guardian name is required")
    .max(100, "Guardian name must be less than 100 characters"),
  guardian_phone: z
    .string()
    .trim()
    .regex(
      /^[\+]?[0-9\s\-\(\)]{7,20}$/,
      "Phone number must be valid (7-20 characters, numbers, spaces, dashes, parentheses allowed)",
    ),
  clinician_name: z
    .string()
    .trim()
    .min(1, "Clinician name is required")
    .max(100, "Clinician name must be less than 100 characters"),
  hospital_clinic: z
    .string()
    .trim()
    .min(1, "Hospital/clinic is required")
    .max(200, "Hospital/clinic name must be less than 200 characters"),
  country: z.string().trim().max(100, "Country must be less than 100 characters").nullable(),
  city: z.string().trim().max(100, "City must be less than 100 characters").nullable(),
  crying_score: z
    .number()
    .int("Score must be a whole number")
    .min(0, "Score cannot be negative")
    .max(6, "Crying score maximum is 6"),
  regurgitation_score: z
    .number()
    .int("Score must be a whole number")
    .min(0, "Score cannot be negative")
    .max(6, "Regurgitation score maximum is 6"),
  stool_score: z
    .number()
    .int("Score must be a whole number")
    .min(0, "Score cannot be negative")
    .max(6, "Stool score maximum is 6"),
  skin_score: z
    .number()
    .int("Score must be a whole number")
    .min(0, "Score cannot be negative")
    .max(12, "Skin score maximum is 12"),
  respiratory_score: z
    .number()
    .int("Score must be a whole number")
    .min(0, "Score cannot be negative")
    .max(3, "Respiratory score maximum is 3"),
  notes: z.string().trim().max(2000, "Notes must be less than 2000 characters").nullable(),
});

const AssessmentForm = () => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // Form state
  const [patientName, setPatientName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
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

  const totalScore =
    (parseInt(cryingScore) || 0) +
    (parseInt(regurgitationScore) || 0) +
    (parseInt(stoolScore) || 0) +
    (parseInt(skinHeadScore) || 0) +
    (parseInt(skinArmsScore) || 0) +
    (parseInt(respiratoryScore) || 0);
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
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];

  // Omani governorates
  const omaniGovernorates = [
    "Muscat",
    "Dhofar",
    "Musandam",
    "Al Buraimi",
    "Ad Dakhiliyah",
    "Ad Dhahirah",
    "Ash Sharqiyah North",
    "Ash Sharqiyah South",
    "Al Batinah North",
    "Al Batinah South",
    "Al Wusta",
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
      const session = await supabase.auth.getSession();
      const currentUser = session.data.session?.user;

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

      // Prepare insert data - user_id is optional for anonymous submissions
      const insertData = {
        user_id: currentUser?.id || null,
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

      const { data, error } = await supabase.from("assessments").insert(insertData).select().single();

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

    const totalScore =
      parseInt(cryingScore) +
      parseInt(regurgitationScore) +
      parseInt(stoolScore) +
      parseInt(skinHeadScore) +
      parseInt(skinArmsScore) +
      parseInt(respiratoryScore);

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
      compress: true,
      putOnlyUsedFonts: true,
    });

    // Page dimensions with proper margins
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    // Colors
    const brandBlue: [number, number, number] = [30, 136, 229];
    const darkGray: [number, number, number] = [60, 60, 60];
    const lightGray: [number, number, number] = [150, 150, 150];
    const black: [number, number, number] = [0, 0, 0];
    const red: [number, number, number] = [220, 38, 38];
    const highlightYellow: [number, number, number] = [255, 255, 204];

    // Helper function to draw a section header
    const drawSectionHeader = (text: string, yPosition: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...brandBlue);
      doc.text(text, margin, yPosition);
      doc.setLineWidth(0.5);
      doc.setDrawColor(...lightGray);
      doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);
      return yPosition + 15;
    };

    // Helper function to draw a field
    const drawField = (label: string, value: string, x: number, yPosition: number, maxWidth: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text(label, x, yPosition);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...black);
      doc.text(value, x + 120, yPosition); // Increased from 80 to 120 for better alignment
    };

    // Start Y position with proper spacing
    let y = margin;

    // Pharmalys logo - LEFT SIDE - BIGGER SIZE
    const logoWidth = 100;
    const logoHeight = 80;
    const logoX = margin; // LEFT ALIGNED
    doc.addImage(logo, "PNG", logoX, y, logoWidth, logoHeight);

    y += logoHeight + 12;

    // Main title - bigger, bold, centered, darker blue (#1E3A8A)
    const darkerBlue: [number, number, number] = [30, 58, 138];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...darkerBlue);
    const titleText = "CoMiSS®: Cow's Milk-related Symptom Score";
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, y);

    y += 15;

    // Thin gray separator line
    const separatorGray: [number, number, number] = [200, 200, 200];
    doc.setLineWidth(0.5);
    doc.setDrawColor(...separatorGray);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // Purpose Section
    y = drawSectionHeader("Purpose", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    const purposeText =
      "CoMiSS® is a simple, fast, and easy-to-use awareness tool for cow's milk-related symptoms. It increases awareness of the most common symptoms of cow's milk allergy (CMA). CoMiSS® can also be used to evaluate and quantify the evolution of symptoms during the therapeutic intervention. CoMiSS® is intended to be used in children from 0 to 24 months.";
    const purposeLines = doc.splitTextToSize(purposeText, contentWidth);
    doc.text(purposeLines, margin, y);
    y += purposeLines.length * 11 + 15;

    // Disclaimer Section - WITH HEADER, text in RED - COMBINED DISCLAIMERS
    y = drawSectionHeader("Disclaimer", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...red);
    const disclaimerText =
      "This tool is not intended for infants with severe and life-threatening symptoms clearly indicating CMA, including anaphylaxis, which requires urgent referral. Infants presenting with failure to thrive and sick infants with hematochezia require urgent referral and full diagnostic work up.\n\nCoMiSS® scoring form is not intended to be used as a diagnostic tool and should not replace an oral food challenge. CMA diagnosis should be confirmed by a 2 to 4 week elimination diet followed by an oral food challenge. Worsening of eczema might be indicative of CMA. If urticaria/angioedema can be directly related to cow's milk (e.g., drinking milk in the absence of other food), this is strongly suggestive of CMA.";
    const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth);
    doc.text(disclaimerLines, margin, y);
    y += disclaimerLines.length * 11 + 15;

    // Patient Details Section
    y = drawSectionHeader("Patient Details", y);
    const col1X = margin;
    const col2X = margin + contentWidth / 2;

    // Row 1: Name and Gender
    drawField("Name:", patientName, col1X, y, 200);
    drawField("Gender:", gender, col2X, y, 200);
    y += 15;

    // Row 2: Age and Guardian
    drawField("Age:", `${age} months`, col1X, y, 200);
    drawField("Guardian:", guardianName, col2X, y, 200);
    y += 15;

    // Row 3: Date and Phone
    drawField("Date:", date, col1X, y, 200);
    drawField("Phone:", guardianPhone, col2X, y, 200);
    y += 20;

    // Clinician Details Section
    y = drawSectionHeader("Clinician Details", y);

    // Row 1: Clinician and Hospital
    drawField("Clinician:", clinicianName, col1X, y, 200);
    drawField("Hospital/Clinic:", hospital, col2X, y, 200);
    y += 15;

    // Row 2: Country and City
    drawField("Country:", country, col1X, y, 200);
    const cityValue = country === "Oman" ? city || "N/A" : "N/A";
    drawField("City:", cityValue, col2X, y, 200);
    y += 20;

    // Helper functions for symptom descriptions
    const getCryingDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        "0": "Less than or equal to 1 hour per day",
        "1": "1 to 1.5 hours per day",
        "2": "1.5 to 2 hours per day",
        "3": "2 to 3 hours per day",
        "4": "3 to 4 hours per day",
        "5": "4 to 5 hours per day",
        "6": "Greater than or equal to 5 hours per day",
      };
      return descriptions[score] || "";
    };

    const getRegurgitationDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        "0": "0-2 episodes of small volumes per day",
        "1": "3+ episodes of small volumes per day",
        "2": "3+ episodes of >half feed in <half feeds",
        "3": "3+ episodes of >half feed in >half feeds",
      };
      return descriptions[score] || "";
    };

    const getStoolDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        "0": "Normal stool (Type 1, 4)",
        "3": "Abnormal stool (Type 2, 3)",
        "6": "Abnormal stool (Type 5, 6)",
      };
      return descriptions[score] || "";
    };

    const getSkinDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        "0": "Absent",
        "2": "Mild",
        "4": "Moderate",
        "6": "Severe",
      };
      return descriptions[score] || "";
    };

    const getRespiratoryDesc = (score: string) => {
      const descriptions: { [key: string]: string } = {
        "0": "No respiratory symptoms",
        "1": "Slight symptoms",
        "2": "Mild symptoms",
        "3": "Severe symptoms",
      };
      return descriptions[score] || "";
    };

    // Symptoms Section
    y = drawSectionHeader("Symptoms", y);

    const symptomValueX = margin + 200;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    doc.text("Crying:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...black);
    doc.text(getCryingDesc(cryingScore), symptomValueX, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text("Regurgitation:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...black);
    doc.text(getRegurgitationDesc(regurgitationScore), symptomValueX, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text("Stool:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...black);
    doc.text(getStoolDesc(stoolScore), symptomValueX, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text("Skin (Head/Neck/Trunk):", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...black);
    doc.text(getSkinDesc(skinHeadScore), symptomValueX, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text("Skin (Arms/Hands/Legs/Feet):", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...black);
    doc.text(getSkinDesc(skinArmsScore), symptomValueX, y);
    y += 12;

    // Urticaria BEFORE Respiratory
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text("Urticaria:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...black);
    doc.text(urticariaPresent ? "Yes" : "No", symptomValueX, y);
    y += 12;

    // Respiratory AFTER Urticaria
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text("Respiratory:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...black);
    doc.text(getRespiratoryDesc(respiratoryScore), symptomValueX, y);
    y += 20;

    // Score Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...brandBlue);
    doc.text(`Score: ${totalScore}`, margin, y);
    y += 20;

    // Interpretation text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...black);
    let interpretation = "";
    if (totalScore < 6) {
      interpretation = "Symptoms are not likely to be related to CMA. Look for other causes.";
    } else if (totalScore >= 6 && totalScore <= 9) {
      interpretation = "More investigation is needed.";
    } else {
      interpretation = "May be suggestive of cow's milk-related symptoms and could potentially be CMA.";
    }
    doc.text(interpretation, margin, y);
    y += 20;

    // Skip the highlighted guides - removed as per user request
    y += 10;

    // Product Recommendation (only for scores >= 10) - NO BORDER
    if (totalScore >= 10) {
      y = drawSectionHeader("Recommended Product", y);

      // Image centered with padding
      const imgWidth = 140;
      const imgHeight = 140;
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = y + 10;
      doc.addImage(primalacImage, "PNG", imgX, imgY, imgWidth, imgHeight);

      y += imgHeight + 20;

      // Product description text - RED COLOR
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...red);
      const productText = "Confirmed Cow's milk allergy cases, consider Primalac ULTIMA CMA (0-12 months)";
      const productLines = doc.splitTextToSize(productText, contentWidth - 40);
      doc.text(productLines, pageWidth / 2, y, { align: "center" });
      y += productLines.length * 12 + 15;

      // Reference directly under product text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...darkGray);
      const refText =
        "Reference: Vandenplas Y, et al. The Cow's Milk Related Symptom Score: The 2022 Update. Nutrients. 2022; 14(13):2683";
      doc.text(refText, pageWidth / 2, y, { align: "center" });
      y += 10;

      // Add clickable link under reference
      doc.setTextColor(...brandBlue);
      doc.setFontSize(8);
      const linkText = "https://www.mdpi.com/2072-6643/14/13/2683";
      const linkWidth = doc.getTextWidth(linkText);
      doc.textWithLink(linkText, (pageWidth - linkWidth) / 2, y, {
        url: "https://www.mdpi.com/2072-6643/14/13/2683",
      });
      y += 30;
    }

    // Notes section if present
    if (notes) {
      y = drawSectionHeader("Notes", y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...black);
      const notesLines = doc.splitTextToSize(notes, contentWidth);
      doc.text(notesLines, margin, y);
      y += notesLines.length * 11 + 15;
    }

    // Save PDF
    doc.save(`CoMiSS_Assessment_${patientName.replace(/\s+/g, "_")}_${date}.pdf`);
    toast.success("PDF exported successfully");
  };

  return (
    <section id="app" className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">CoMiSS Assessment</CardTitle>
            <CardDescription>
              Fill the form and click <strong>Save</strong> to enable <strong>Export PDF</strong>.
            </CardDescription>
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
                  <Input id="age" type="number" placeholder="0" value={age} onChange={(e) => setAge(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Use exact months (round to nearest if needed).</p>
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
                  <Select
                    value={country}
                    onValueChange={(value) => {
                      setCountry(value);
                      if (value !== "Oman") {
                        setCity("");
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-[300px]">
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City / Governorate</Label>
                  <Select value={city} onValueChange={setCity} disabled={country !== "Oman"}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder={country === "Oman" ? "Select governorate" : "Select Oman first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {omaniGovernorates.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
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
              <p className="text-sm text-muted-foreground mb-4">
                All symptoms must be assessed - Assessed by parents without any obvious cause (≥1 week duration, no
                infectious disease)
              </p>

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
                      <SelectItem value="2">
                        ≥ 3 episodes of &gt; half of the feed volume in &lt; half of feeds (2)
                      </SelectItem>
                      <SelectItem value="3">
                        ≥ 3 episodes of &gt; half of the feed volume in ≥ half of feeds (3)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stool">Stools</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Brussels Infant and Toddlers Stool Scale (BITSS).
                  </p>
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
                      <Label htmlFor="skin-head" className="text-sm font-normal">
                        Head/Neck/Trunk
                      </Label>
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
                      <Label htmlFor="skin-arms" className="text-sm font-normal">
                        Arms/Hands/Legs/Feet
                      </Label>
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
                <span className="text-sm font-medium">
                  {totalScore} / {maxScore}
                </span>
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
              <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked as boolean)} />
              <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I consent to the collection and secure storage of the information entered in this form for the purpose
                of scientific research. I understand that this information will be used only for clinical assessment and
                will not be shared with third parties without the guardian&apos;s explicit permission, except where
                required by law.
              </label>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-between flex-wrap items-center">
              <div className="text-sm font-medium">Total: {totalScore}</div>
              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={saved || saving}>
                  {saving ? "Saving..." : saved ? "Saved ✓" : "Save Assessment"}
                </Button>
                <Button onClick={handleExport} disabled={!saved} variant="outline">
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPatientName("");
                    setGender("");
                    setAge("");
                    setDate(new Date().toISOString().split("T")[0]);
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
