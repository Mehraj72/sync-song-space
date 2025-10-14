import React, { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SongInfo {
  title?: string;
  artist?: string;
  audioUrl?: string;
}

const MusicPlayer = ({ song }: { song?: SongInfo }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [progress, setProgress] = useState([0]);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, song]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border z-40">
      <div className="px-4 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider 
            value={progress} 
            onValueChange={setProgress}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1:24</span>
            <span>3:45</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-gradient-primary rounded-lg flex-shrink-0"></div>
            <div className="hidden md:block">
              <h4 className="font-semibold">{song?.title || "Song Title"}</h4>
              <p className="text-sm text-muted-foreground">{song?.artist || "Artist Name"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "ml-2 transition-smooth",
                isLiked && "text-accent"
              )}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </Button>
          </div>
          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              className="w-12 h-12 rounded-full gradient-primary glow-effect"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
          {/* Volume */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="w-5 h-5" />
            <Slider 
              value={volume} 
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-32"
            />
          </div>
        </div>
        {/* Audio Element */}
        {song?.audioUrl && (
          <audio ref={audioRef} src={song.audioUrl} />
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
