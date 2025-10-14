import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SongCard from "@/components/SongCard";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const songs = [
    { id: 1, title: "Starlight", artist: "Cosmic Dream", duration: "4:20", color: "from-purple-500 to-blue-500" },
    { id: 2, title: "Neon Nights", artist: "Cyber Wave", duration: "3:55", color: "from-pink-500 to-purple-500" },
    { id: 3, title: "Paradise", artist: "Island Groove", duration: "3:42", color: "from-green-500 to-teal-500" },
    { id: 4, title: "Thunder", artist: "Storm Chasers", duration: "4:08", color: "from-gray-500 to-blue-500" },
    { id: 5, title: "Sunset Drive", artist: "Night Riders", duration: "3:58", color: "gradient-sunset" },
    { id: 6, title: "Ocean Eyes", artist: "Blue Horizon", duration: "4:12", color: "gradient-ocean" },
    { id: 7, title: "Midnight City", artist: "Synthwave", duration: "3:50", color: "from-indigo-500 to-purple-500" },
    { id: 8, title: "Golden Hour", artist: "Aurora", duration: "4:05", color: "from-yellow-400 to-orange-500" },
    { id: 9, title: "Dreamscape", artist: "Skyline", duration: "3:47", color: "from-blue-400 to-cyan-400" },
    { id: 10, title: "Firefly", artist: "Luminous", duration: "3:33", color: "from-orange-400 to-pink-500" },
  ];

  return (
    <div className="min-h-screen pb-32">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6">Your Library</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-effect"
          />
        </div>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="glass-effect mb-6">
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                title={song.title}
                artist={song.artist}
                duration={song.duration}
                coverColor={song.color}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="albums">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Your albums will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="artists">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Your favorite artists will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="liked">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Songs you like will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;
