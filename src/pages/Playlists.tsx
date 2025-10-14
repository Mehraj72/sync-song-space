import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Playlists = () => {
  const playlists = [
    { id: 1, name: "My Favorites", count: 45, color: "from-purple-600 to-pink-600" },
    { id: 2, name: "Workout Mix", count: 32, color: "from-red-600 to-orange-600" },
    { id: 3, name: "Chill Sessions", count: 28, color: "from-blue-600 to-cyan-600" },
    { id: 4, name: "Party Vibes", count: 51, color: "from-green-600 to-teal-600" },
  ];

  return (
    <div className="min-h-screen pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Your Playlists</h1>
        <Button className="gradient-primary glow-effect gap-2">
          <Plus className="w-5 h-5" />
          Create Playlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="gradient-card rounded-xl p-6 card-shadow transition-smooth hover:scale-105 cursor-pointer"
          >
            <div className={cn("w-full aspect-square rounded-lg mb-4 bg-gradient-to-br", playlist.color)}></div>
            <h3 className="text-xl font-semibold mb-2">{playlist.name}</h3>
            <p className="text-muted-foreground">{playlist.count} songs</p>
          </div>
        ))}
      </div>

      {/* Collaborative Playlists Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Shared with You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="gradient-card rounded-xl p-6 card-shadow transition-smooth hover:scale-105 cursor-pointer">
            <div className="w-full aspect-square rounded-lg mb-4 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <p className="text-6xl">🎵</p>
            </div>
            <h3 className="text-xl font-semibold mb-2">Road Trip 2024</h3>
            <p className="text-muted-foreground">Shared by Alex • 38 songs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playlists;
