import { ReactNode } from "react";
import Navigation from "./Navigation";
import MusicPlayer from "./MusicPlayer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [role, setRole] = useState("user");
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          
          setRole(roleData?.role || 'user');
        } else {
          setRole('user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navigation role={role} />
      <main className="ml-20 lg:ml-64 p-6">
        {children}
      </main>
  {/* MusicPlayer is now controlled by Home page only */}
    </div>
  );
};

export default Layout;
