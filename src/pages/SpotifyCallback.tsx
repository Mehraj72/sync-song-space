import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Connecting to Spotify...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        throw new Error('Spotify authorization failed');
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      setStatus('Exchanging authorization code...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: callbackError } = await supabase.functions.invoke('spotify-callback', {
        body: { code, userId: user.id }
      });

      if (callbackError) throw callbackError;

      toast.success('Successfully connected to Spotify!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Callback error:', error);
      toast.error(error.message || 'Failed to connect to Spotify');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero">
      <div className="glass-effect p-8 rounded-xl text-center">
        <div className="loader mb-4"></div>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;
