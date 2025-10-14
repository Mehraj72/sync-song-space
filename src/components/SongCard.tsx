import { Play, Heart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SongCardProps {
  title: string;
  artist: string;
  duration?: string;
  coverColor?: string;
  isLiked?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
}

const SongCard = ({ 
  title, 
  artist, 
  duration = "3:45",
  coverColor = "from-purple-500 to-pink-500",
  isLiked = false,
  onPlay,
  onLike 
}: SongCardProps) => {
  return (
    <div className="group relative gradient-card rounded-xl p-4 card-shadow transition-smooth hover:scale-105 cursor-pointer">
      <div className={cn("w-full aspect-square rounded-lg mb-4 bg-gradient-to-br", coverColor)}></div>
      
      <h3 className="font-semibold text-foreground mb-1 truncate">{title}</h3>
      <p className="text-sm text-muted-foreground truncate">{artist}</p>
      <p className="text-xs text-muted-foreground mt-1">{duration}</p>
      
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-smooth">
        <Button
          size="icon"
          className="w-12 h-12 rounded-full gradient-primary glow-effect"
          onClick={onPlay}
        >
          <Play className="w-5 h-5 ml-0.5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-8 h-8 transition-smooth",
            isLiked && "text-accent"
          )}
          onClick={onLike}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SongCard;
