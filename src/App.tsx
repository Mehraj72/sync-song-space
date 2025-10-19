import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Library from "./pages/Library";
import SpotifyCallback from "./pages/SpotifyCallback";
import Playlists from "./pages/Playlists";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { useEffect, useState } from "react";
import { auth } from "@/integrations/firebase/client";


const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Fetch user role from Firestore
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
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole("user");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><span className="loader"></span></div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Only show Login/Signup if not authenticated */}
            {!user && <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Signup />} />
              <Route path="*" element={<Signup />} />
            </>}
            {/* Authenticated user routes */}
            {user && role === "user" && <>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/library" element={<Layout><Library /></Layout>} />
              <Route path="/callback" element={<SpotifyCallback />} />
              <Route path="/playlists" element={<Layout><Playlists /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </>}
            {/* Admin routes */}
            {user && role === "admin" && <>
              <Route path="/" element={<Navigate to="/admin-dashboard" />} />
              <Route path="/admin-dashboard" element={<Layout><AdminDashboard /></Layout>} />
              <Route path="/admin" element={<Layout><Admin /></Layout>} />
              <Route path="/callback" element={<SpotifyCallback />} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </>}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
