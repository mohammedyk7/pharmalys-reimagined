import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AssessmentForm from "@/components/AssessmentForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <AssessmentForm />
      </main>
    </div>
  );
};

export default Index;
