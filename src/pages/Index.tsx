import { useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AssessmentForm from "@/components/AssessmentForm";
import Auth from "@/components/Auth";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const handleAuthStateChange = (newSession: Session | null, newUser: User | null) => {
    setSession(newSession);
    setUser(newUser);
  };

  const handleSignOut = () => {
    setSession(null);
    setUser(null);
  };

  if (!session || !user) {
    return <Auth onAuthStateChange={handleAuthStateChange} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={handleSignOut} />
      <main>
        <Hero />
        <Features />
        <AssessmentForm userId={user.id} />
      </main>
    </div>
  );
};

export default Index;
