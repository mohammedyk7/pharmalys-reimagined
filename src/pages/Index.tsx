import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AssessmentForm from "@/components/AssessmentForm";
import PublicHeader from "@/components/PublicHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <Hero />
        <Features />
        <AssessmentForm />
      </main>
    </div>
  );
};

export default Index;
