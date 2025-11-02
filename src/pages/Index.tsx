import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AssessmentForm from "@/components/AssessmentForm";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <Hero />
        <Features />
        <AssessmentForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
