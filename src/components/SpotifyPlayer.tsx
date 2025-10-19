import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useSpotify } from '@/hooks/useSpotify';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string }[];
  };
  uri: string;
  duration_ms: number;
}

interface SpotifyPlayerProps {
  currentTrack?: Track | null;
  onPlayPause?: (isPlaying: boolean) => void;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

const SpotifyPlayer = ({ currentTrack, onPlayPause }: SpotifyPlayerProps) => {
  const { tokens } = useSpotify();
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [isLiked, setIsLiked] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!tokens?.access_token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Sync Song Space',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(tokens.access_token);
        },
        volume: 0.7,
      });

      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      spotifyPlayer.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
        onPlayPause?.(!state.paused);
      });

      spotifyPlayer.connect();
      playerRef.current = spotifyPlayer;
      setPlayer(spotifyPlayer);
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [tokens]);

  useEffect(() => {
    if (currentTrack && deviceId && tokens?.access_token) {
      playTrack(currentTrack.uri);
    }
  }, [currentTrack, deviceId]);

  const playTrack = async (uri: string) => {
    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.access_token}`,
        },
        body: JSON.stringify({ uris: [uri] }),
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const togglePlayPause = () => {
    if (player) {
      player.togglePlay();
    }
  };

  const skipToPrevious = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const skipToNext = () => {
    if (player) {
      player.nextTrack();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (player) {
      player.setVolume(value[0] / 100);
    }
  };

  const handleSeek = (value: number[]) => {
    if (player) {
      player.seek(value[0]);
      setPosition(value[0]);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!tokens) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border z-40">
      <div className="px-4 py-4">
        <div className="mb-4">
          <Slider
            value={[position]}
            onValueChange={handleSeek}
            max={duration}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-gradient-primary rounded-lg flex-shrink-0 overflow-hidden">
              {currentTrack?.album.images[0] && (
                <img src={currentTrack.album.images[0].url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="hidden md:block">
              <h4 className="font-semibold">{currentTrack?.name || 'No track playing'}</h4>
              <p className="text-sm text-muted-foreground">
                {currentTrack?.artists.map(a => a.name).join(', ') || 'No artist'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
              className={cn('ml-2 transition-smooth', isLiked && 'text-accent')}
            >
              <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={skipToPrevious}>
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              className="w-12 h-12 rounded-full gradient-primary glow-effect"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={skipToNext}>
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="w-5 h-5" />
            <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
