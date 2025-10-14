// Free-to-use songs array for your music project
export const songs = [
  {
    name: "Acoustic Breeze",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3"
  },
  {
    name: "Creative Minds",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3"
  },
  {
    name: "Sunny",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3"
  },
  {
    name: "Energy",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-energy.mp3"
  },
  {
    name: "Jazz Frenchy",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3"
  },
  {
    name: "Once Again",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-onceagain.mp3"
  },
  {
    name: "Ukulele",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3"
  },
  {
    name: "Memories",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-memories.mp3"
  },
  {
    name: "Buddy",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-buddy.mp3"
  },
  {
    name: "Going Higher",
    artist: "Bensound",
    url: "https://www.bensound.com/bensound-music/bensound-goinghigher.mp3"
  }
];

// Example: Play a song by index
export function playSong(index) {
  const audio = new Audio(songs[index].url);
  audio.play();
}
