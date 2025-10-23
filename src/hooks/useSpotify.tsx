import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSpotify = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsConnected(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('spotify_tokens')
        .select('expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsConnected(!!data);
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectSpotify = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-login');
      if (error) throw error;
      
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
    }
  };

  const callSpotifyAPI = async (endpoint: string, method = 'GET', body?: any) => {
    try {
      // Check if token needs refresh
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: tokenData } = await supabase
        .from('spotify_tokens')
        .select('expires_at')
        .eq('user_id', user.id)
        .single();

      if (new Date(tokenData.expires_at) <= new Date()) {
        await supabase.functions.invoke('spotify-refresh');
      }

      const { data, error } = await supabase.functions.invoke('spotify-api', {
        body: { endpoint, method, body }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Spotify API error:', error);
      throw error;
    }
  };

  return {
    isConnected,
    loading,
    connectSpotify,
    callSpotifyAPI,
  };
};
