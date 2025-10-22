import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SongCard from "@/components/SongCard";
import { supabase } from "@/integrations/supabase/client";
import MusicPlayer from "@/components/MusicPlayer";
import { toast } from "sonner";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserAndSongs();
  }, []);

  const loadUserAndSongs = async () => {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    setUserId(session?.user?.id || null);

    // Load all songs
    const { data: songs, error } = await supabase
      .from('songs')
      .select(`
        *,
        artists:artist_id (name, image_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading songs:', error);
      toast.error('Failed to load songs');
      return;
    }

    setAllSongs(songs || []);
    setFilteredSongs(songs || []);

    // Load liked songs if user is logged in
    if (session?.user) {
      const { data: likes } = await supabase
        .from('user_likes')
        .select(`
          song_id,
          songs:song_id (
            *,
            artists:artist_id (name, image_url)
          )
        `)
        .eq('user_id', session.user.id);

      if (likes) {
        setLikedSongs(likes.map(l => l.songs).filter(Boolean));
        setLikedSongIds(new Set(likes.map(l => l.song_id)));
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredSongs(allSongs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allSongs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.artists?.name?.toLowerCase().includes(query) ||
      song.genre?.toLowerCase().includes(query)
    );
    setFilteredSongs(filtered);
  };

  const handleSongClick = (song: any) => {
    setCurrentSong({
      title: song.title,
      artist: song.artists?.name || 'Unknown Artist',
      audioUrl: song.file_url,
      imageUrl: song.artists?.image_url,
    });

    // Add to listening history
    if (userId) {
      supabase.from('listening_history').insert({
        user_id: userId,
        song_id: song.id,
      });
    }
  };

  const handleToggleLike = async (songId: string) => {
    if (!userId) {
      toast.error('Please login to like songs');
      return;
    }

    const isLiked = likedSongIds.has(songId);

    // Optimistic update
    setLikedSongIds(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(songId);
      else next.add(songId);
      return next;
    });

    try {
      if (isLiked) {
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', userId)
          .eq('song_id', songId);
        
        toast.success('Removed from liked songs');
      } else {
        await supabase
          .from('user_likes')
          .insert({ user_id: userId, song_id: songId });
        
        toast.success('Added to liked songs');
      }

      // Reload liked songs
      loadUserAndSongs();
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setLikedSongIds(prev => {
        const next = new Set(prev);
        if (isLiked) next.add(songId);
        else next.delete(songId);
        return next;
      });
      toast.error('Failed to update likes');
    }
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearch({ preventDefault: () => {} } as any);
    }
  }, [searchQuery]);

  return (
    <>
      <div className="min-h-screen pb-32">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6">Your Library</h1>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search songs, artists, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-effect"
            />
          </form>
        </div>

        <Tabs defaultValue="songs" className="w-full">
          <TabsList className="glass-effect mb-6">
            <TabsTrigger value="songs">All Songs</TabsTrigger>
            <TabsTrigger value="liked">Liked Songs</TabsTrigger>
          </TabsList>

          <TabsContent value="songs">
            {filteredSongs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No songs found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    title={song.title}
                    artist={song.artists?.name || 'Unknown Artist'}
                    duration={`${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`}
                    coverColor={song.cover_color || "from-purple-500 to-blue-500"}
                    imageUrl={song.artists?.image_url}
                    isLiked={likedSongIds.has(song.id)}
                    onLike={() => handleToggleLike(song.id)}
                    onPlay={() => handleSongClick(song)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked">
            {likedSongs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't liked any songs yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {likedSongs.map((song) => (
                  <SongCard
                    key={song.id}
                    title={song.title}
                    artist={song.artists?.name || 'Unknown Artist'}
                    duration={`${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`}
                    coverColor={song.cover_color || "from-purple-500 to-blue-500"}
                    imageUrl={song.artists?.image_url}
                    isLiked={true}
                    onLike={() => handleToggleLike(song.id)}
                    onPlay={() => handleSongClick(song)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <MusicPlayer song={currentSong} />
    </>
  );
};

export default Library;
