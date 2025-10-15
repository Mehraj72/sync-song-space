import React, { useState } from "react";
import SongCard from "@/components/SongCard";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-music.jpg";
import { useNavigate } from "react-router-dom";
import { auth } from "@/integrations/firebase/client";
import { songs } from "@/lib/songs";
import MusicPlayer from "@/components/MusicPlayer";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [likedSongsSet, setLikedSongsSet] = useState<Set<string>>(new Set());
  const [currentSong, setCurrentSong] = useState(null);
  const navigate = useNavigate();

  // handle play: set current song and add to user's recentlyPlayed
  const handlePlay = async (song: any) => {
    setCurrentSong(song);
    if (!user) return;
    try {
      const { db } = await import("@/integrations/firebase/client");
      const { doc, getDoc, updateDoc, setDoc } = await import("firebase/firestore");
      const profileRef = doc(db, "users", user.uid);
      const profileSnap = await getDoc(profileRef);
      let existing: any[] = [];
      if (profileSnap.exists()) existing = profileSnap.data().recentlyPlayed || [];
      const songObj = { title: song.name, artist: song.artist, url: song.url, playedAt: Date.now() };
      // remove duplicates by url
      const filtered = existing.filter((s: any) => s.url !== songObj.url);
      const updated = [songObj, ...filtered].slice(0, 50);
      if (profileSnap.exists()) {
        await updateDoc(profileRef, { recentlyPlayed: updated });
      } else {
        await setDoc(profileRef, { recentlyPlayed: updated }, { merge: true });
      }
    } catch (err) {
      console.error("Failed to update recentlyPlayed", err);
    }
  };

  // handle toggle like: add/remove song in user's likedSongs
  const handleToggleLike = async (song: any, index: number) => {
    // optimistic UI update using url key
    setLikedSongsSet(prev => {
      const next = new Set(prev);
      const key = song.url || song.name || String(index);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

    if (!user) return;
    try {
      const { db } = await import("@/integrations/firebase/client");
      const { doc, getDoc, updateDoc, setDoc } = await import("firebase/firestore");
      const profileRef = doc(db, "users", user.uid);
      const profileSnap = await getDoc(profileRef);
      let existing: any[] = [];
      if (profileSnap.exists()) existing = profileSnap.data().likedSongs || [];
      const key = song.url || song.name || String(index);
      const exists = existing.find((s: any) => (s.url || s.name) === key);
      if (exists) {
        const filtered = existing.filter((s: any) => (s.url || s.name) !== key);
        await updateDoc(profileRef, { likedSongs: filtered });
      } else {
        const songObj = { title: song.name, artist: song.artist, url: song.url };
        const updated = [songObj, ...existing];
        if (profileSnap.exists()) await updateDoc(profileRef, { likedSongs: updated });
        else await setDoc(profileRef, { likedSongs: updated }, { merge: true });
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  // Check authentication state
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setIsAuthenticated(!!u);
      setUser(u);
      if (u) {
        try {
          const { db } = await import("@/integrations/firebase/client");
          const { doc, getDoc } = await import("firebase/firestore");
          const profileRef = doc(db, "users", u.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            const liked = new Set<string>((data.likedSongs || []).map((s: any) => String(s.url || s.name || s)));
            setLikedSongsSet(liked);
          }
        } catch (err) {
          console.error("Failed to load user preferences", err);
        }
      } else {
        setLikedSongsSet(new Set());
      }
    });
    return () => unsubscribe();
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
