import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotify } from '@/hooks/useSpotify';
import { Loader2 } from 'lucide-react';

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const { handleCallback } = useSpotify();

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        console.error('Spotify auth error:', error);
        navigate('/library');
        return;
      }

      if (code) {
        const success = await handleCallback(code);
        if (success) {
          navigate('/library');
        } else {
          navigate('/library');
        }
      } else {
        navigate('/library');
      }
    };

    processCallback();
  }, [handleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
        <p className="text-lg">Connecting to Spotify...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;
