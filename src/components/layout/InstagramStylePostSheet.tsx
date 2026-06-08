import {
  Image,
  Film,
  Sparkles,
  X,
  ChevronUp,
  Square,
  Play,
  Zap,
  Heart,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { haptic } from "@/lib/haptics";

interface PostOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
  action: () => void;
}

export function InstagramStylePostSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(isOpen);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePostTypeSelect = (id: string) => {
    haptic("selection");
    onClose();
    // Navigate to create with post type
    navigate({ to: "/create", search: { type: id } });
  };

  const postOptions: PostOption[] = [
    {
      id: "photo",
      label: "Photo",
      description: "Share a single photo",
      icon: Image,
      color: "from-blue-500 to-cyan-500",
      bgGradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      action: () => handlePostTypeSelect("photo"),
    },
    {
      id: "video",
      label: "Video",
      description: "Share a video (up to 30s)",
      icon: Film,
      color: "from-purple-500 to-pink-500",
      bgGradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
      action: () => handlePostTypeSelect("video"),
    },
    {
      id: "story",
      label: "Story",
      description: "Share a quick story",
      icon: Square,
      color: "from-green-500 to-emerald-500",
      bgGradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
      action: () => handlePostTypeSelect("story"),
    },
    {
      id: "reel",
      label: "Reel",
      description: "Create a short-form video",
      icon: Play,
      color: "from-orange-500 to-red-500",
      bgGradient: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
      action: () => handlePostTypeSelect("reel"),
    },
    {
      id: "poll",
      label: "Poll",
      description: "Create an interactive poll",
      icon: Zap,
      color: "from-yellow-500 to-amber-500",
      bgGradient: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20",
      action: () => handlePostTypeSelect("poll"),
    },
    {
      id: "collab",
      label: "Collaboration",
      description: "Create with others",
      icon: Heart,
      color: "from-rose-500 to-fuchsia-500",
      bgGradient: "bg-gradient-to-br from-rose-500/20 to-fuchsia-500/20",
      action: () => handlePostTypeSelect("collab"),
    },
  ];

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: isVisible
            ? "rgba(0, 0, 0, 0.4)"
            : "rgba(0, 0, 0, 0)",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onClick={() => {
          haptic("light");
          onClose();
        }}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          boxShadow: isVisible
            ? "0 -20px 60px rgba(0, 0, 0, 0.8)"
            : "none",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Handle / Drag Indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Create
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Choose what you want to create
            </p>
          </div>
          <button
            onClick={() => {
              haptic("light");
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-6 pb-8">
          {/* Grid of Post Options */}
          <div className="grid grid-cols-2 gap-3">
            {postOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={option.action}
                  className={`group relative p-4 rounded-2xl border border-white/10 transition-all duration-300 hover:border-white/30 active:scale-95 overflow-hidden`}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)",
                  }}
                  onPointerDown={() => haptic("selection")}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 ${option.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                  />

                  {/* Icon Container */}
                  <div
                    className={`inline-flex p-3 rounded-xl mb-3 bg-gradient-to-br ${option.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <Icon className="size-6 text-white" />
                  </div>

                  {/* Text Content */}
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                      {option.label}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-snug group-hover:text-zinc-300 transition-colors">
                      {option.description}
                    </p>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Tips Section */}
          <div className="mt-6 p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
            <p className="text-[11px] text-zinc-400 font-mono tracking-wider uppercase">
              💡 Pro Tip
            </p>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Mix photos, videos, and interactive polls to keep your content fresh and engaging.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
