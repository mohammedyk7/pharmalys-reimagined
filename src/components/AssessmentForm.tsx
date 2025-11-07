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

// Validation schema
const assessmentSchema = z.object({
  patient_name: z.string().trim().min(1, "Patient name is required").max(100),
  patient_gender: z.enum(["Male", "Female"]),
  patient_age_months: z.number().int().min(0).max(240),
  guardian_name: z.string().trim().min(1).max(100),
  guardian_phone: z
    .string()
    .trim()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/),
  clinician_name: z.string().trim().min(1).max(100),
  hospital_clinic: z.string().trim().min(1).max(200),
  country: z.string().trim().max(100).nullable(),
  city: z.string().trim().max(100).nullable(),
  crying_score: z.number().int().min(0).max(6),
  regurgitation_score: z.number().int().min(0).max(6),
  stool_score: z.number().int().min(0).max(6),
  skin_score: z.number().int().min(0).max(12),
  respiratory_score: z.number().int().min(0).max(3),
  notes: z.string().trim().max(2000).nullable(),
});

interface AssessmentFormProps {
  userId?: string;
}

const AssessmentForm = ({ userId }: AssessmentFormProps = {}) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

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
    if (totalScore <= 10) return { text: "Low likelihood of CMPA", recommendation: "Continue monitoring" };
    else if (totalScore <= 15)
      return { text: "Moderate likelihood of CMPA", recommendation: "Consider dietary changes" };
    else return { text: "High likelihood of CMPA", recommendation: "Consider referral" };
  };

  const analysis = getAnalysis();

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

  // Save handler
  const handleSave = async () => {
    if (!consent) {
      toast.error("Please accept the consent form");
      return;
    }

    if (!cryingScore || !regurgitationScore || !stoolScore || !skinHeadScore || !skinArmsScore || !respiratoryScore) {
      toast.error("Please select all symptom scores before saving");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      const validatedData = assessmentSchema.parse(formData);

      const insertData = {
        user_id: user?.id || null,
        assessment_date: date,
        ...validatedData,
        skin_head_neck_trunk_score: parseInt(skinHeadScore) || 0,
        skin_arms_hands_legs_feet_score: parseInt(skinArmsScore) || 0,
        urticaria_present: urticariaPresent,
      };

      const { data, error } = await supabase.from("assessments").insert(insertData).select().single();
      if (error) {
        toast.error(`Database error: ${error.message}`);
        setSaving(false);
        return;
      }

      setAssessmentId(data.id);
      setSaved(true);
      toast.success("Assessment saved successfully");
    } catch (error: any) {
      if (error instanceof z.ZodError) toast.error(error.errors[0].message);
      else toast.error("Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  // Export PDF handler (fixed)
  const handleExport = () => {
    if (!saved) {
      toast.error("Please save the assessment first");
      return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    const brandBlue = [30, 136, 229];
    const darkGray = [60, 60, 60];
    const lightGray = [150, 150, 150];
    const black = [0, 0, 0];
    const red = [220, 38, 38];
    const darkerBlue = [30, 58, 138];

    const drawSectionHeader = (text, yPosition) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...brandBlue);
      doc.text(text, margin, yPosition);
      doc.setLineWidth(0.5);
      doc.setDrawColor(...lightGray);
      doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);
      return yPosition + 15;
    };

    const drawField = (label, value, x, yPosition) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...darkGray);
      doc.text(label, x, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...black);
      doc.text(value, x + 80, yPosition);
    };

    let y = margin;

    doc.addImage(logo, "PNG", margin, y, 100, 80);
    y += 90;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...darkerBlue);
    const title = "CoMiSS®: Cow's Milk-related Symptom Score";
    const titleX = (pageWidth - doc.getTextWidth(title)) / 2;
    doc.text(title, titleX, y);

    y += 25;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    y = drawSectionHeader("Purpose", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    const purpose =
      "CoMiSS® is a simple, fast, and easy-to-use awareness tool for cow's milk-related symptoms. It increases awareness of the most common symptoms of cow's milk allergy (CMA). CoMiSS® can also be used to evaluate and quantify the evolution of symptoms during the therapeutic intervention. CoMiSS® is intended to be used in children from 0 to 24 months.";
    doc.text(doc.splitTextToSize(purpose, contentWidth), margin, y);
    y += 70;

    y = drawSectionHeader("Disclaimer", y);
    doc.setTextColor(...red);
    const disclaimer =
      "This tool is not intended for infants with severe and life-threatening symptoms clearly indicating CMA, including anaphylaxis, which requires urgent referral. Infants presenting with failure to thrive and sick infants with hematochezia require urgent referral and full diagnostic work up.\n\nCoMiSS® scoring form is not intended to be used as a diagnostic tool and should not replace an oral food challenge. CMA diagnosis should be confirmed by a 2 to 4 week elimination diet followed by an oral food challenge.";
    doc.text(doc.splitTextToSize(disclaimer, contentWidth), margin, y);
    y += 100;

    y = drawSectionHeader("Patient Details", y);
    const col2 = margin + contentWidth / 2;
    drawField("Name:", patientName, margin, y);
    drawField("Gender:", gender, col2, y);
    y += 15;
    drawField("Age:", `${age} months`, margin, y);
    drawField("Guardian:", guardianName, col2, y);
    y += 15;
    drawField("Date:", date, margin, y);
    drawField("Phone:", guardianPhone, col2, y);
    y += 25;

    y = drawSectionHeader("Clinician Details", y);
    drawField("Clinician:", clinicianName, margin, y);
    drawField("Hospital:", hospital, col2, y);
    y += 15;
    drawField("Country:", country, margin, y);
    drawField("City:", city || "N/A", col2, y);
    y += 25;

    y = drawSectionHeader("Symptoms", y);
    const sx = margin + 200;
    const sxData = [
      ["Crying", cryingScore],
      ["Regurgitation", regurgitationScore],
      ["Stool", stoolScore],
      ["Skin (Head/Neck/Trunk)", skinHeadScore],
      ["Skin (Arms/Hands/Legs/Feet)", skinArmsScore],
      ["Urticaria", urticariaPresent ? "Yes" : "No"],
      ["Respiratory", respiratoryScore],
    ];
    sxData.forEach(([label, val]) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkGray);
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...black);
      doc.text(String(val), sx, y);
      y += 12;
    });

    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...brandBlue);
    doc.text(`Score: ${totalScore}`, margin, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...black);
    const interpretation =
      totalScore < 6
        ? "Symptoms are not likely to be related to CMA. Look for other causes."
        : totalScore <= 9
          ? "More investigation is needed."
          : "May be suggestive of cow's milk-related symptoms and could potentially be CMA.";
    doc.text(interpretation, margin, y);
    y += 25;

    if (totalScore >= 10) {
      y = drawSectionHeader("Recommended Product", y);
      const imgWidth = 140;
      const imgHeight = 140;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(primalacImage, "PNG", imgX, y, imgWidth, imgHeight);
      y += imgHeight + 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...red);
      const productText = "Confirmed Cow's milk allergy cases, consider Primalac ULTIMA CMA (0-12 months)";
      doc.text(doc.splitTextToSize(productText, contentWidth - 40), pageWidth / 2, y, {
        align: "center",
      });
      y += 30;
    }

    if (notes) {
      y = drawSectionHeader("Notes", y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...black);
      doc.text(doc.splitTextToSize(notes, contentWidth), margin, y);
      y += 30;
    }

    // Footer reference (only here)
    const footerY = pageHeight - margin - 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...darkGray);
    const reference =
      "Reference: Vandenplas Y, et al. The Cow's Milk Related Symptom Score: The 2022 Update. Nutrients. 2022; 14(13):2683";
    doc.text(doc.splitTextToSize(reference, contentWidth), margin, footerY);
    doc.setTextColor(...brandBlue);
    doc.textWithLink("https://www.mdpi.com/2072-6643/14/13/2683", margin, footerY + 12, {
      url: "https://www.mdpi.com/2072-6643/14/13/2683",
    });

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
            {/* PATIENT DETAILS */}
            {/* ... rest of your JSX form identical ... */}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AssessmentForm;
