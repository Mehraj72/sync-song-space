import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch user data and playlists from Firestore
    toast({ title: "Welcome to your dashboard 🎵" });
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">User Dashboard</h1>
      <div className="mb-8">
        <div className="relative max-w-lg mx-auto mb-6">
          <input
            type="text"
            placeholder="Search playlists, songs..."
            className="w-full p-3 rounded-lg glass-effect text-base bg-background text-foreground"
          />
        </div>
        <h2 className="text-xl font-semibold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {/* Example playlists */}
          <div className="gradient-card rounded-xl p-4 card-shadow">
            <h3 className="font-bold mb-2">Chill Vibes</h3>
            <p className="text-muted-foreground">12 songs</p>
          </div>
          <div className="gradient-card rounded-xl p-4 card-shadow">
            <h3 className="font-bold mb-2">Workout Hits</h3>
            <p className="text-muted-foreground">8 songs</p>
          </div>
          <div className="gradient-card rounded-xl p-4 card-shadow">
            <h3 className="font-bold mb-2">Party Mix</h3>
            <p className="text-muted-foreground">15 songs</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Liked Songs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Example liked songs */}
          <div className="gradient-card rounded-lg p-3 flex flex-col items-start">
            <span className="font-semibold">Starlight</span>
            <span className="text-sm text-muted-foreground">Cosmic Dream</span>
          </div>
          <div className="gradient-card rounded-lg p-3 flex flex-col items-start">
            <span className="font-semibold">Neon Nights</span>
            <span className="text-sm text-muted-foreground">Cyber Wave</span>
          </div>
          <div className="gradient-card rounded-lg p-3 flex flex-col items-start">
            <span className="font-semibold">Paradise</span>
            <span className="text-sm text-muted-foreground">Island Groove</span>
          </div>
          <div className="gradient-card rounded-lg p-3 flex flex-col items-start">
            <span className="font-semibold">Thunder</span>
            <span className="text-sm text-muted-foreground">Storm Chasers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
