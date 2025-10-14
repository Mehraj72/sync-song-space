-- Create artists table
CREATE TABLE public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create albums table
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  release_year INTEGER,
  cover_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL, -- in seconds
  file_url TEXT,
  cover_color TEXT,
  mood TEXT,
  genre TEXT,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lyrics table with timestamped lines for karaoke
CREATE TABLE public.lyrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  line_number INTEGER NOT NULL,
  start_time DECIMAL NOT NULL, -- in seconds
  end_time DECIMAL NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(song_id, line_number)
);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_color TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Create user_likes table
CREATE TABLE public.user_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Create listening_history table
CREATE TABLE public.listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Artists are viewable by everyone" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Albums are viewable by everyone" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Songs are viewable by everyone" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Lyrics are viewable by everyone" ON public.lyrics FOR SELECT USING (true);

-- RLS Policies for playlists
CREATE POLICY "Public playlists are viewable by everyone" ON public.playlists 
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON public.playlists 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON public.playlists 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON public.playlists 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlist_songs
CREATE POLICY "Playlist songs are viewable if playlist is accessible" ON public.playlist_songs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add songs to their playlists" ON public.playlist_songs 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove songs from their playlists" ON public.playlist_songs 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- RLS Policies for user_likes
CREATE POLICY "Users can view their own likes" ON public.user_likes 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can like songs" ON public.user_likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike songs" ON public.user_likes 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for listening_history
CREATE POLICY "Users can view their own history" ON public.listening_history 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their history" ON public.listening_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_songs_artist ON public.songs(artist_id);
CREATE INDEX idx_songs_mood ON public.songs(mood);
CREATE INDEX idx_lyrics_song ON public.lyrics(song_id);
CREATE INDEX idx_playlist_songs_playlist ON public.playlist_songs(playlist_id);
CREATE INDEX idx_user_likes_user ON public.user_likes(user_id);
CREATE INDEX idx_listening_history_user ON public.listening_history(user_id);

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_play_count(song_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.songs 
  SET play_count = play_count + 1 
  WHERE id = song_id_param;
END;
$$;