import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Heart, Music, ListMusic } from "lucide-react";
import { auth } from "@/integrations/firebase/client";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [savedLyrics, setSavedLyrics] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const { db } = await import("@/integrations/firebase/client");
          const { doc, getDoc } = await import("firebase/firestore");
          const profileRef = doc(db, "users", firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setProfile({
              username: data.username || "",
              email: firebaseUser.email || ""
            });
            setLikedSongs(data.likedSongs || []);
            setUserPlaylists(data.playlists || []);
            setRecentlyPlayed(data.recentlyPlayed || []);
            setSavedLyrics(data.savedLyrics || []);
            setArtists(data.artists || []);
          } else {
            setProfile({ username: "", email: firebaseUser.email || "" });
          }
        } catch {
          setProfile({ username: "", email: firebaseUser.email || "" });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    { label: "Liked Songs", value: likedSongs.length.toString(), icon: Heart },
    { label: "Playlists", value: userPlaylists.length.toString(), icon: ListMusic },
    { label: "Artists", value: artists.length.toString(), icon: Music },
  ];

  const handleEdit = () => {
    setEditUsername(profile.username);
    setEditEmail(profile.email);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const { db } = await import("@/integrations/firebase/client");
      const { doc, updateDoc } = await import("firebase/firestore");
      const profileRef = doc(db, "users", user.uid);
      await updateDoc(profileRef, { username: editUsername });
      setProfile({ username: editUsername, email: editEmail });
      setEditOpen(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

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
              <h1 className="text-4xl font-bold mb-2">{profile.username || "Music Lover"}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={handleEdit}>
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
        {/* Edit Profile Modal */}
        {editOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-background rounded-xl p-8 card-shadow w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Username</label>
                <input
                  className="w-full p-2 rounded border"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block mb-1 font-medium">Email</label>
                <input
                  className="w-full p-2 rounded border bg-muted-foreground/10"
                  value={editEmail}
                  disabled
                />
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Recently Played */}
        <Card className="gradient-card p-6 card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
          <div className="space-y-3">
            {recentlyPlayed.length === 0 ? (
              <p className="text-muted-foreground">You haven't played any songs yet.</p>
            ) : (
              recentlyPlayed.map((item, idx) => {
                const title = item?.title || item?.name || item || `Song ${idx + 1}`;
                const artist = item?.artist || item?.album || "Unknown Artist";
                const duration = item?.duration || "-:--";
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10 transition-smooth cursor-pointer">
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    <div className="flex-1">
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-muted-foreground">{artist}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{duration}</p>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Lyric Book */}
        <Card className="gradient-card p-6 card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Saved Lyrics</h2>
          <p className="text-muted-foreground mb-4">Your favorite lyrics will be saved here</p>
          <div className="space-y-4">
            {savedLyrics.length === 0 ? (
              <p className="text-muted-foreground">You have no saved lyrics yet.</p>
            ) : (
              savedLyrics.map((lyric, idx) => (
                <div key={idx} className="glass-effect rounded-lg p-4">
                  <p className="italic mb-2">{lyric?.text || lyric?.snippet || lyric || '"(lyrics snippet)"'}</p>
                  <p className="text-sm text-muted-foreground">{lyric?.song || lyric?.title || ''} {lyric?.artist ? `- ${lyric.artist}` : ''}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Playlists */}
        <Card className="gradient-card p-6 card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
          {userPlaylists.length === 0 ? (
            <p className="text-muted-foreground">You haven't created any playlists yet.</p>
          ) : (
            <div className="space-y-3">
              {userPlaylists.map((pl, i) => (
                <div key={pl.id || i} className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/10">
                  <div>
                    <p className="font-semibold">{pl.title || pl.name || `Playlist ${i + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{(pl.songs && pl.songs.length) ? `${pl.songs.length} songs` : '0 songs'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Liked Songs */}
        <Card className="gradient-card p-6 card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Liked Songs</h2>
          {likedSongs.length === 0 ? (
            <p className="text-muted-foreground">You haven't liked any songs yet.</p>
          ) : (
            <div className="space-y-3">
              {likedSongs.map((s, i) => (
                <div key={s.id || i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/10">
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-emerald-400 to-teal-500"></div>
                  <div className="flex-1">
                    <p className="font-semibold">{s.title || s.name || `Song ${i + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{s.artist || s.album || 'Unknown Artist'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={async () => {
              await auth.signOut();
              navigate('/signup');
            }}
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
