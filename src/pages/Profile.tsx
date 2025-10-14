import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Heart, Music, ListMusic } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Liked Songs", value: "234", icon: Heart },
    { label: "Playlists", value: "12", icon: ListMusic },
    { label: "Artists", value: "87", icon: Music },
  ];

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="gradient-card rounded-xl p-8 card-shadow mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center text-5xl">
              👤
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Music Lover</h1>
              <p className="text-muted-foreground">member@vibestream.com</p>
              <Button variant="outline" className="mt-4 gap-2">
                <Settings className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="glass-effect rounded-lg p-4 text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently Played */}
        <Card className="gradient-card p-6 card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 transition-smooth cursor-pointer">
                <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <div className="flex-1">
                  <p className="font-semibold">Song Title {i}</p>
                  <p className="text-sm text-muted-foreground">Artist Name</p>
                </div>
                <p className="text-sm text-muted-foreground">3:45</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Lyric Book */}
        <Card className="gradient-card p-6 card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Saved Lyrics</h2>
          <p className="text-muted-foreground mb-4">Your favorite lyrics will be saved here</p>
          <div className="space-y-4">
            <div className="glass-effect rounded-lg p-4">
              <p className="italic mb-2">"And I can see us lost in the memory..."</p>
              <p className="text-sm text-muted-foreground">August - Taylor Swift</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => navigate('/auth')}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
