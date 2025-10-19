import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'eb4ce04e364f412ba87e892ffc404820';
const REDIRECT_URI = `${window.location.origin}/callback`;
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-library-read',
  'playlist-read-private',
].join(' ');

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export const useSpotify = () => {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('spotify_tokens');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.expires_at > Date.now()) {
        setTokens(parsed);
      } else {
        refreshAccessToken(parsed.refresh_token);
      }
    }
    setIsLoading(false);
  }, []);

  const getAuthUrl = () => {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      show_dialog: 'true',
    });
    return `https://accounts.spotify.com/authorize?${params}`;
  };

  const handleCallback = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-auth', {
        body: { code, redirect_uri: REDIRECT_URI },
      });

      if (error) throw error;

      const newTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      };

      localStorage.setItem('spotify_tokens', JSON.stringify(newTokens));
      setTokens(newTokens);
      return true;
    } catch (error) {
      console.error('Error handling Spotify callback:', error);
      return false;
    }
  };

  const refreshAccessToken = async (refresh_token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-refresh', {
        body: { refresh_token },
      });

      if (error) throw error;

      const newTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      };

      localStorage.setItem('spotify_tokens', JSON.stringify(newTokens));
      setTokens(newTokens);
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('spotify_tokens');
    setTokens(null);
  };

  return {
    tokens,
    isLoading,
    isAuthenticated: !!tokens,
    getAuthUrl,
    handleCallback,
    logout,
  };
};
