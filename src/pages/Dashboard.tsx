import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSpotify } from "@/hooks/useSpotify";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { Input } from "@/components/ui/input";
import { Search, Music2 } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isConnected, loading, connectSpotify, callSpotifyAPI } = useSpotify();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isConnected) {
      loadSpotifyData();
    }
  }, [isConnected]);

  const loadSpotifyData = async () => {
    try {
      const [playlistsData, recentData, artistsData] = await Promise.all([
        callSpotifyAPI('/me/playlists?limit=6'),
        callSpotifyAPI('/me/player/recently-played?limit=10'),
        callSpotifyAPI('/me/top/artists?limit=6'),
      ]);

      setPlaylists(playlistsData?.items || []);
      setRecentTracks(recentData?.items || []);
      setTopArtists(artistsData?.items || []);
    } catch (error) {
      console.error('Error loading Spotify data:', error);
      toast.error('Failed to load Spotify data');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const data = await callSpotifyAPI(`/search?q=${encodeURIComponent(searchQuery)}&type=track,artist,album&limit=20`);
      setSearchResults(data?.tracks?.items || []);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const toggleLike = (trackId: string) => {
    setLikedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
        toast.success('Removed from liked songs');
      } else {
        next.add(trackId);
        toast.success('Added to liked songs');
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loader"></span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Music2 className="w-24 h-24 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            Connect to Spotify
          </h1>
          <p className="text-muted-foreground mb-8">
            Connect your Spotify account to access your playlists, recently played songs, and more!
          </p>
          <Button size="lg" onClick={connectSpotify} className="gradient-primary">
            Connect Spotify
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((track) => (
              <div
                key={track.id}
                className="gradient-card p-4 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setCurrentTrack(track)}
              >
                <div className="flex items-center gap-4">
                  {track.album?.images?.[0] && (
                    <img 
                      src={track.album.images[0].url} 
                      alt={`${track.name} by ${track.artists?.map((a: any) => a.name).join(', ')}`} 
                      className="w-16 h-16 rounded" 
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artists?.map((a: any) => a.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Played */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recentTracks.map((item, idx) => (
            <div
              key={idx}
              className="gradient-card p-4 rounded-lg cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setCurrentTrack(item.track)}
            >
              {item.track?.album?.images?.[0] && (
                <img 
                  src={item.track.album.images[0].url} 
                  alt={`${item.track.name} album cover`} 
                  className="w-full aspect-square rounded mb-3" 
                />
              )}
              <p className="font-semibold text-sm truncate">{item.track?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {item.track?.artists?.map((a: any) => a.name).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Your Playlists */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="gradient-card p-4 rounded-lg hover:scale-[1.02] transition-transform cursor-pointer">
              {playlist.images?.[0] && (
                <img 
                  src={playlist.images[0].url} 
                  alt={`${playlist.name} playlist cover`} 
                  className="w-full aspect-square rounded mb-3" 
                />
              )}
              <p className="font-semibold truncate">{playlist.name}</p>
              <p className="text-sm text-muted-foreground">{playlist.tracks?.total} tracks</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Artists */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Your Top Artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topArtists.map((artist) => (
            <div key={artist.id} className="gradient-card p-4 rounded-lg text-center hover:scale-105 transition-transform cursor-pointer">
              {artist.images?.[0] && (
                <img 
                  src={artist.images[0].url} 
                  alt={`${artist.name} artist photo`} 
                  className="w-full aspect-square rounded-full mb-3" 
                />
              )}
              <p className="font-semibold text-sm truncate">{artist.name}</p>
            </div>
          ))}
        </div>
      </section>

      <SpotifyPlayer
        track={currentTrack}
        isLiked={currentTrack ? likedTracks.has(currentTrack.id) : false}
        onLike={() => currentTrack && toggleLike(currentTrack.id)}
      />
    </div>
  );
};

export default Dashboard;
