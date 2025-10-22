import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Heart, Music, ListMusic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [likedCount, setLikedCount] = useState(0);
  const [playlistsCount, setPlaylistsCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          loadProfile(session.user.id, session.user.email || '');
        } else {
          setUserId(null);
          setProfile({ username: "", email: "" });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadProfile(session.user.id, session.user.email || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid: string, email: string) => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', uid)
        .single();

      setProfile({
        username: profileData?.username || "",
        email: email
      });

      // Load stats
      const { count: likeCount } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid);

      const { count: playlistCount } = await supabase
        .from('playlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid);

      const { count: histCount } = await supabase
        .from('listening_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid);

      setLikedCount(likeCount || 0);
      setPlaylistsCount(playlistCount || 0);
      setHistoryCount(histCount || 0);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const stats = [
    { label: "Liked Songs", value: likedCount.toString(), icon: Heart },
    { label: "Playlists", value: playlistsCount.toString(), icon: ListMusic },
    { label: "Played", value: historyCount.toString(), icon: Music },
  ];

  const handleEdit = () => {
    setEditUsername(profile.username);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: editUsername })
        .eq('user_id', userId);

      if (error) throw error;

      setProfile({ ...profile, username: editUsername });
      setEditOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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
              <div className="flex gap-4">
                <Button variant="secondary" onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={handleSignOut}
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
