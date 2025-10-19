import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Music } from "lucide-react";
import SongCard from "@/components/SongCard";
import { useSpotify } from "@/hooks/useSpotify";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { toast } from "sonner";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [spotifyTracks, setSpotifyTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const { tokens, isAuthenticated, getAuthUrl, logout } = useSpotify();

  useEffect(() => {
    if (isAuthenticated && tokens?.access_token) {
      searchSpotifyTracks('top hits');
    }
  }, [isAuthenticated, tokens]);

  const searchSpotifyTracks = async (query: string) => {
    if (!tokens?.access_token) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      const data = await response.json();
      setSpotifyTracks(data.tracks?.items || []);
    } catch (error) {
      console.error('Error searching Spotify:', error);
      toast.error('Failed to search tracks');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchSpotifyTracks(searchQuery);
    }
  };

  const handleTrackClick = (track: any) => {
    setCurrentTrack(track);
  };

  return (
    <>
      <div className="min-h-screen pb-32">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold">Your Library</h1>
            {!isAuthenticated ? (
              <Button onClick={() => window.location.href = getAuthUrl()} className="gradient-primary">
                <Music className="w-4 h-4 mr-2" />
                Connect Spotify
              </Button>
            ) : (
              <Button onClick={logout} variant="outline">
                Disconnect Spotify
              </Button>
            )}
          </div>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search songs, artists, albums on Spotify..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect"
              disabled={!isAuthenticated}
            />
          </form>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Connect to Spotify</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Spotify account to browse and play millions of songs
            </p>
            <Button onClick={() => window.location.href = getAuthUrl()} className="gradient-primary">
              <Music className="w-4 h-4 mr-2" />
              Connect Spotify
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="songs" className="w-full">
            <TabsList className="glass-effect mb-6">
              <TabsTrigger value="songs">Songs</TabsTrigger>
              <TabsTrigger value="albums">Albums</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
              <TabsTrigger value="liked">Liked</TabsTrigger>
            </TabsList>

            <TabsContent value="songs">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {spotifyTracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handleTrackClick(track)}
                    className="cursor-pointer"
                  >
                    <SongCard
                      title={track.name}
                      artist={track.artists.map((a: any) => a.name).join(', ')}
                      duration={`${Math.floor(track.duration_ms / 60000)}:${Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}`}
                      coverColor="from-purple-500 to-blue-500"
                      imageUrl={track.album.images[0]?.url}
                    />
                  </div>
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
        )}
      </div>
      <SpotifyPlayer currentTrack={currentTrack} />
    </>
  );
};

export default Library;
