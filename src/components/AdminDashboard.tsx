import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Assessment {
  id: string;
  patient_name: string;
  patient_age_months: number;
  patient_gender: string;
  guardian_name: string;
  clinician_name: string;
  hospital_clinic: string;
  assessment_date: string;
  crying_score: number;
  regurgitation_score: number;
  stool_score: number;
  skin_score: number;
  respiratory_score: number;
  total_score: number;
  created_at: string;
}

const AdminDashboard = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch assessments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (score: number) => {
    if (score <= 5) return <Badge variant="secondary">Mild</Badge>;
    if (score <= 11) return <Badge className="bg-yellow-500">Moderate</Badge>;
    return <Badge variant="destructive">Severe</Badge>;
  };

  const stats = {
    total: assessments.length,
    mild: assessments.filter(a => a.total_score <= 5).length,
    moderate: assessments.filter(a => a.total_score > 5 && a.total_score <= 11).length,
    severe: assessments.filter(a => a.total_score > 11).length,
    avgScore: assessments.length > 0 
      ? (assessments.reduce((sum, a) => sum + a.total_score, 0) / assessments.length).toFixed(1)
      : 0,
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">View and analyze all CoMiSS assessments</p>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Assessments</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Mild (≤5)</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.mild}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Moderate (6-11)</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.moderate}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Severe (≥12)</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.severe}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl">{stats.avgScore}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
          <CardDescription>Complete list of patient assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Age (months)</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Clinician</TableHead>
                <TableHead>Hospital/Clinic</TableHead>
                <TableHead className="text-center">Total Score</TableHead>
                <TableHead className="text-center">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No assessments found
                  </TableCell>
                </TableRow>
              ) : (
                assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{new Date(assessment.assessment_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{assessment.patient_name}</TableCell>
                    <TableCell>{assessment.patient_age_months}</TableCell>
                    <TableCell>{assessment.patient_gender}</TableCell>
                    <TableCell>{assessment.guardian_name}</TableCell>
                    <TableCell>{assessment.clinician_name}</TableCell>
                    <TableCell>{assessment.hospital_clinic}</TableCell>
                    <TableCell className="text-center font-bold">{assessment.total_score}</TableCell>
                    <TableCell className="text-center">{getSeverityBadge(assessment.total_score)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
