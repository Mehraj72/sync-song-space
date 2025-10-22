import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Playlists = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUserId(session?.user?.id || null);
        
        if (session?.user) {
          loadPlaylists(session.user.id);
        } else {
          setPlaylists([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      if (session?.user) {
        loadPlaylists(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPlaylists = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', uid);

      if (error) throw error;
      setPlaylists(data || []);
    } catch (err) {
      console.error('Failed to load playlists:', err);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          user_id: userId,
          name: newName,
          cover_color: 'from-purple-600 to-pink-600',
        })
        .select()
        .single();

      if (error) throw error;

      setPlaylists(prev => [...prev, data]);
      setNewName("");
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Your Playlists</h1>
        <Button className="gradient-primary glow-effect gap-2" onClick={() => setModalOpen(true)}>
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
            <div className={cn("w-full aspect-square rounded-lg mb-4 bg-gradient-to-br", playlist.cover_color)}></div>
            <h3 className="text-xl font-semibold mb-2">{playlist.name}</h3>
            <p className="text-muted-foreground">0 songs</p>
          </div>
        ))}
      </div>

      {/* Create Playlist Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-8 card-shadow w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Playlist</h2>
            <input
              className="w-full p-2 rounded border mb-6"
              placeholder="Playlist Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <div className="flex gap-4">
              <Button variant="secondary" onClick={handleCreate}>Create</Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
