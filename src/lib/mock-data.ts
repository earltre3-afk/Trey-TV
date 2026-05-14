import chris from "@/assets/creator-chris.jpg";
import treyi from "@/assets/creator-treyi.jpg";
import lena from "@/assets/creator-lena.jpg";
import zay from "@/assets/creator-zay.jpg";
import postStudio from "@/assets/post-studio.jpg";
import postNight from "@/assets/post-night.jpg";
import postConcert from "@/assets/post-concert.jpg";
import profileTrey from "@/assets/pixel-profile-portrait.jpg";

export const creators = [
  { id: "chris", name: "Chris H.", handle: "chrishorizon", avatar: chris, ring: "magenta" as const, live: true, verified: "creator" as const },
  { id: "treyi", name: "Trey-I", handle: "treyipicks", avatar: treyi, ring: "cyan" as const, verified: "creator" as const },
  { id: "lena", name: "Lena", handle: "lena", avatar: lena, ring: "magenta" as const, verified: "creator" as const },
  { id: "zay", name: "Zay Beats", handle: "zaybeats", avatar: zay, ring: "purple" as const, verified: "creator" as const },
  { id: "maya", name: "Maya", handle: "maya", avatar: lena, ring: "cyan" as const, verified: "user" as const },
];

export const posts = [
  {
    id: "1",
    creator: creators[0],
    timeAgo: "2h",
    text: "Behind the scenes of my new video shoot 🎬\nThis one's going to be crazy. Stay tuned!",
    media: postStudio,
    duration: "1:45",
    likes: 1200, comments: 86, reshares: 34, saves: 215,
  },
  {
    id: "2",
    creator: creators[1],
    timeAgo: "4h",
    text: "High energy track for your workout 🎵",
    media: postConcert,
    duration: "3:12",
    likes: 845, comments: 52, reshares: 21, saves: 110,
  },
  {
    id: "3",
    creator: creators[2],
    timeAgo: "6h",
    text: "Late night thoughts in the city. Some moods can't be explained.",
    media: postNight,
    duration: "0:48",
    likes: 2100, comments: 142, reshares: 67, saves: 320,
  },
];

export const moods = [
  { id: "all", label: "All Vibes", icon: "Infinity", color: "purple" },
  { id: "motivated", label: "Motivated", icon: "Zap", color: "gold" },
  { id: "chill", label: "Chill", icon: "Leaf", color: "cyan" },
  { id: "happy", label: "Happy", icon: "Smile", color: "magenta" },
  { id: "focused", label: "Focused", icon: "Target", color: "cyan" },
  { id: "inspired", label: "Inspired", icon: "Star", color: "purple" },
  { id: "hype", label: "Hype", icon: "Flame", color: "magenta" },
  { id: "reflective", label: "Reflective", icon: "Cloud", color: "cyan" },
] as const;

export const prescribed = [
  { id: "p1", kind: "VIDEO", title: "Level Up Your Mindset", creator: "Chris Horizon", media: postStudio, duration: "12:45", mood: "Motivated", moodColor: "gold" as const, vibes: ["all", "motivated", "focused", "hype"] },
  { id: "p2", kind: "MUSIC", title: "Late Night Drive", creator: "Zay Beats", media: postNight, duration: "03:21", mood: "Chill", moodColor: "cyan" as const, vibes: ["all", "chill", "reflective", "happy"] },
  { id: "p3", kind: "LIVE", title: "Creator Talk Live", creator: "Lena", media: postConcert, viewers: "2.3K", mood: "Inspired", moodColor: "purple" as const, vibes: ["all", "inspired", "motivated"] },
  { id: "p4", kind: "VIDEO", title: "Morning Grind Ritual", creator: "Chris Horizon", media: postStudio, duration: "08:30", mood: "Motivated", moodColor: "gold" as const, vibes: ["motivated", "hype", "focused"] },
  { id: "p5", kind: "MUSIC", title: "Focus Flow Mix", creator: "Zay Beats", media: postNight, duration: "45:00", mood: "Focused", moodColor: "cyan" as const, vibes: ["focused", "chill"] },
  { id: "p6", kind: "LIVE", title: "Hype Hour with Zay", creator: "Zay Beats", media: postConcert, viewers: "8.7K", mood: "Hype", moodColor: "magenta" as const, vibes: ["hype", "motivated", "happy"] },
  { id: "p7", kind: "VIDEO", title: "Night Reflections", creator: "Lena", media: postNight, duration: "15:22", mood: "Reflective", moodColor: "cyan" as const, vibes: ["reflective", "chill"] },
  { id: "p8", kind: "VIDEO", title: "Laugh Track: Season 2", creator: "Lena", media: postConcert, duration: "22:00", mood: "Happy", moodColor: "magenta" as const, vibes: ["happy", "hype"] },
  { id: "p9", kind: "VIDEO", title: "Creative Block Breaker", creator: "Trey-I", media: postStudio, duration: "10:00", mood: "Inspired", moodColor: "purple" as const, vibes: ["inspired", "focused", "motivated"] },
];

export const currentUser = {
  name: "Trey",
  handle: "trey",
  uid: "4234118205271678",
  avatar: profileTrey,
  banner: "/profile-banner",
  bio: "I create. I inspire. I elevate.\nYour favorite creator's favorite creator.",
  location: "Los Angeles, CA",
  link: "trey.tv",
  verified: "creator" as const,
  stats: { posts: 248, followers: "128K", following: 342, prescriptions: "1.2K" },
};
