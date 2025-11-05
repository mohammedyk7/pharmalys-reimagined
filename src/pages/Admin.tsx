import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import Auth from "@/components/Auth";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(true); // Keep loading until admin check completes

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
                setLoading(false);
              });
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
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
            setLoading(false);
          });
      } else {
        setLoading(false);
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
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session || !user) {
    return <Auth onAuthStateChange={handleAuthStateChange} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onSignOut={handleSignOut} showHomeButton={true} />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have admin privileges to access this page.
            </p>
            <a href="/" className="text-primary hover:underline">
              Go back to home
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={handleSignOut} showHomeButton={true} />
      <main>
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
