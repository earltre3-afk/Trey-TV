import { useRef, useState } from "react";
import { BufferingScreen } from "./BufferingScreen";

interface Props {
  src?: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  fallbackImg?: string;
  onProgress?: (progress: { currentTime: number; duration: number; ratio: number }) => void;
  onEnded?: () => void;
}

export function VideoPlayer({
  src,
  poster,
  className,
  controls = true,
  fallbackImg,
  onProgress,
  onEnded,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buffering, setBuffering] = useState(!!src);
  const [dismissed, setDismissed] = useState(false);

  function handlePlay() {
    setBuffering(false);
    setDismissed(true);
    videoRef.current?.play();
  }

  if (!src) {
    return <img src={fallbackImg} className={className} alt="" />;
  }

  return (
    <div className="relative size-full">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={className}
        controls={controls}
        onWaiting={() => {
          if (dismissed) setBuffering(true);
        }}
        onPlaying={() => setBuffering(false)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (!video.duration || Number.isNaN(video.duration)) return;
          onProgress?.({
            currentTime: video.currentTime,
            duration: video.duration,
            ratio: video.currentTime / video.duration,
          });
        }}
        onEnded={onEnded}
      />
      {buffering && <BufferingScreen onPlay={handlePlay} />}
    </div>
  );
}
