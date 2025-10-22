import React, { useState, useEffect } from "react";
import SongCard from "@/components/SongCard";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-music.jpg";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MusicPlayer from "@/components/MusicPlayer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [currentSong, setCurrentSong] = useState(null);
  const [allSongs, setAllSongs] = useState<any[]>([]);
  const navigate = useNavigate();

  // Load songs and auth state
  useEffect(() => {
    loadSongs();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session?.user);
        setUserId(session?.user?.id || null);
        
        if (session?.user) {
          loadLikedSongs(session.user.id);
        } else {
          setLikedSongIds(new Set());
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
      
      if (session?.user) {
        loadLikedSongs(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSongs = async () => {
    const { data: songs } = await supabase
      .from('songs')
      .select(`
        *,
        artists:artist_id (name, image_url)
      `)
      .order('play_count', { ascending: false })
      .limit(12);

    setAllSongs(songs || []);
  };

  const loadLikedSongs = async (uid: string) => {
    const { data: likes } = await supabase
      .from('user_likes')
      .select('song_id')
      .eq('user_id', uid);

    if (likes) {
      setLikedSongIds(new Set(likes.map(like => like.song_id)));
    }
  };

  const handlePlay = async (song: any) => {
    setCurrentSong({
      title: song.title,
      artist: song.artists?.name || 'Unknown Artist',
      audioUrl: song.file_url,
      imageUrl: song.artists?.image_url,
    });

    if (userId) {
      await supabase.from('listening_history').insert({
        user_id: userId,
        song_id: song.id,
      });
      
      // Increment play count
      await supabase.rpc('increment_play_count', { song_id_param: song.id });
    }
  };

  const handleToggleLike = async (songId: string) => {
    if (!userId) {
      toast.error('Please login to like songs');
      return;
    }

    const isLiked = likedSongIds.has(songId);

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
      } else {
        await supabase
          .from('user_likes')
          .insert({ user_id: userId, song_id: songId });
      }
    } catch (error) {
      setLikedSongIds(prev => {
        const next = new Set(prev);
        if (isLiked) next.add(songId);
        else next.delete(songId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section */}
      <section 
        className="relative h-96 rounded-3xl overflow-hidden mb-12"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 gradient-hero opacity-80"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          {!isAuthenticated && (
            <div className="absolute top-8 right-8 flex gap-4">
              <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
              <Button variant="secondary" onClick={() => navigate("/signup")}>Sign Up</Button>
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
            Your Music, Your Way
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
            Stream millions of songs with interactive lyrics and personalized playlists
          </p>
          <Button size="lg" className="gradient-primary glow-effect text-lg px-8 py-6">
            Start Listening
          </Button>
        </div>
      </section>

      {/* Featured Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Today</h2>
          <Button variant="ghost" onClick={() => navigate('/library')}>View All</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {allSongs.map((song) => (
            <SongCard
              key={song.id}
              title={song.title}
              artist={song.artists?.name || 'Unknown Artist'}
              duration={`${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`}
              coverColor={song.cover_color || "from-purple-600 to-pink-600"}
              imageUrl={song.artists?.image_url}
              isLiked={likedSongIds.has(song.id)}
              onLike={() => handleToggleLike(song.id)}
              onPlay={() => handlePlay(song)}
            />
          ))}
        </div>
      </section>

      {/* Popular Playlists */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Popular Playlists</h2>
          <Button variant="ghost" onClick={() => navigate('/playlists')}>View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Chill Vibes", tracks: "50 tracks", color: "from-indigo-600 to-purple-600" },
            { title: "Workout Mix", tracks: "40 tracks", color: "from-red-600 to-orange-600" },
            { title: "Focus Flow", tracks: "35 tracks", color: "from-blue-600 to-cyan-600" },
            { title: "Party Time", tracks: "60 tracks", color: "from-pink-600 to-purple-600" },
          ].map((playlist, index) => (
            <div 
              key={index}
              className="gradient-card rounded-xl p-6 card-shadow transition-smooth hover:scale-105 cursor-pointer"
            >
              <div className={cn("w-full aspect-square rounded-lg mb-4 bg-gradient-to-br", playlist.color)}></div>
              <h3 className="font-semibold text-lg mb-1">{playlist.title}</h3>
              <p className="text-sm text-muted-foreground">{playlist.tracks}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mood Based */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Mood Based</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { mood: "Happy", color: "from-yellow-400 to-orange-500" },
            { mood: "Relaxed", color: "from-green-400 to-teal-500" },
            { mood: "Energetic", color: "from-red-400 to-pink-500" },
            { mood: "Melancholic", color: "from-blue-400 to-indigo-500" },
          ].map((item, index) => (
            <div
              key={index}
              className={cn(
                "h-32 rounded-xl bg-gradient-to-br cursor-pointer",
                "transition-smooth hover:scale-105 card-shadow",
                "flex items-center justify-center",
                item.color
              )}
            >
              <h3 className="text-2xl font-bold text-white">{item.mood}</h3>
            </div>
          ))}
        </div>
      </section>
      <MusicPlayer song={currentSong} />
    </div>
  );
};

export default Home;
