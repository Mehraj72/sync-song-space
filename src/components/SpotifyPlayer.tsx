import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SpotifyPlayerProps {
  track: any;
  onNext?: () => void;
  onPrevious?: () => void;
  isLiked?: boolean;
  onLike?: () => void;
}

const SpotifyPlayer = ({ track, onNext, onPrevious, isLiked, onLike }: SpotifyPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && track?.preview_url) {
      audioRef.current.src = track.preview_url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      if (onNext) onNext();
    });

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [onNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current || !track?.preview_url) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 glass-effect border-t border-border z-50">
      <audio ref={audioRef} />
      
      <div className="h-full px-4 flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {track.album?.images?.[0] && (
            <img 
              src={track.album.images[0].url} 
              alt={`${track.name} album cover`}
              className="w-14 h-14 rounded"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate">{track.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {track.artists?.map((a: any) => a.name).join(', ')}
            </p>
          </div>
          {onLike && (
            <Heart
              className={`w-5 h-5 cursor-pointer transition-colors ${
                isLiked ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={onLike}
              aria-label={isLiked ? 'Unlike song' : 'Like song'}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <SkipBack 
              className="w-5 h-5 cursor-pointer hover:text-primary transition-colors"
              onClick={onPrevious}
              aria-label="Previous track"
            />
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
              disabled={!track.preview_url}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              )}
            </button>
            <SkipForward 
              className="w-5 h-5 cursor-pointer hover:text-primary transition-colors"
              onClick={onNext}
              aria-label="Next track"
            />
          </div>
          <div className="w-full max-w-md">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              className="w-full"
              onValueChange={(value) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = (value[0] / 100) * audioRef.current.duration;
                }
              }}
              aria-label="Song progress"
            />
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Volume2 className="w-5 h-5" aria-label="Volume" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={(value) => setVolume(value[0])}
            aria-label="Volume control"
          />
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
