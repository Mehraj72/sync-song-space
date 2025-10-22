import React, { useState } from "react";
import SongCard from "@/components/SongCard";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-music.jpg";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { songs } from "@/lib/songs";
import MusicPlayer from "@/components/MusicPlayer";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [likedSongsSet, setLikedSongsSet] = useState<Set<string>>(new Set());
  const [currentSong, setCurrentSong] = useState(null);
  const navigate = useNavigate();

  // handle play: set current song and add to user's listening history
  const handlePlay = async (song: any) => {
    setCurrentSong(song);
    if (!userId) return;
    
    try {
      // Add to listening history (you'll need to create this table if needed)
      await supabase.from('listening_history').insert({
        user_id: userId,
        song_id: song.id, // Adjust based on your song structure
        played_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to update listening history", err);
    }
  };

  // handle toggle like: add/remove song in user's liked songs
  const handleToggleLike = async (song: any, index: number) => {
    const key = song.url || song.name || String(index);
    
    // Optimistic UI update
    setLikedSongsSet(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); 
      else next.add(key);
      return next;
    });

    if (!userId) return;
    
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('song_id', song.id) // Adjust based on your song structure
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from('user_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like
        await supabase
          .from('user_likes')
          .insert({
            user_id: userId,
            song_id: song.id, // Adjust based on your song structure
          });
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
      // Revert optimistic update on error
      setLikedSongsSet(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); 
        else next.add(key);
        return next;
      });
    }
  };

  // Check authentication state
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session?.user);
        setUserId(session?.user?.id || null);
        
        if (session?.user) {
          // Load user's liked songs
          const { data: likes } = await supabase
            .from('user_likes')
            .select('song_id')
            .eq('user_id', session.user.id);

          if (likes) {
            const likedSet = new Set<string>(likes.map(like => String(like.song_id)));
            setLikedSongsSet(likedSet);
          }
        } else {
          setLikedSongsSet(new Set());
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
      setUserId(session?.user?.id || null);
      
      if (session?.user) {
        supabase
          .from('user_likes')
          .select('song_id')
          .eq('user_id', session.user.id)
          .then(({ data: likes }) => {
            if (likes) {
              const likedSet = new Set<string>(likes.map(like => String(like.song_id)));
              setLikedSongsSet(likedSet);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
          {/* Show Login/Signup buttons if not authenticated */}
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
          <Button variant="ghost">View All</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {songs.map((song, idx) => (
            <SongCard
              key={idx}
              title={song.name}
              artist={song.artist}
              duration={""}
              coverColor={"from-purple-600 to-pink-600"}
              isLiked={likedSongsSet.has(song.url || song.name || String(idx))}
              onLike={() => handleToggleLike(song, idx)}
              onPlay={() => handlePlay(song)}
            />
          ))}
        </div>
      </section>

      {/* Popular Playlists */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Popular Playlists</h2>
          <Button variant="ghost">View All</Button>
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
      {/* Music Player for selected song */}
      <MusicPlayer song={currentSong ? { title: currentSong.name, artist: currentSong.artist, audioUrl: currentSong.url } : undefined} />
    </div>
  );
};

export default Home;

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
