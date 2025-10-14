import { ReactNode } from "react";
import Navigation from "./Navigation";
import MusicPlayer from "./MusicPlayer";

import { useEffect, useState } from "react";
import { auth } from "@/integrations/firebase/client";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [role, setRole] = useState("user");
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { db } = await import("@/integrations/firebase/client");
          const { doc, getDoc } = await import("firebase/firestore");
          const profileRef = doc(db, "users", firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setRole(profileSnap.data().role || "user");
          } else {
            setRole("user");
          }
        } catch {
          setRole("user");
        }
      } else {
        setRole("user");
      }
    });
    return () => unsubscribe();
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
