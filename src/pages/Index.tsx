import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import AssessmentForm from "@/components/AssessmentForm";
import AdminDashboard from "@/components/AdminDashboard";
import Auth from "@/components/Auth";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase call with setTimeout to prevent deadlock
          setTimeout(() => {
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "admin")
              .maybeSingle()
              .then(({ data: roleData }) => {
                setIsAdmin(!!roleData);
              });
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data: roleData }) => {
            setIsAdmin(!!roleData);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <>
            <Hero />
            <Features />
            <AssessmentForm userId={user!.id} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
