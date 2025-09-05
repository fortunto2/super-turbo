import { RefObject, useEffect, useRef, useState } from "react";

interface VideoPreviewProps {
  url: string;
  onPlayingChange?: (value: boolean) => void;
  isPlaying?: boolean;
  duration: number;
  voiceoverSrc?: string | null;
  musicSrc?: string | null;
  soundEffectSrc?: string | null;
  isReady: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  updateCanvasSize: () => void;
}

export function VideoPreview({
  url,
  onPlayingChange,
  isPlaying,
  duration,
  voiceoverSrc,
  musicSrc,
  soundEffectSrc,
  isReady,
  videoRef,
  updateCanvasSize,
}: VideoPreviewProps) {
  const voiceoverRef = useRef<HTMLAudioElement>(null);
  const soundFXRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);
  const currentTime = useRef(0);

  const [isVoiceoverEnded, setIsVoiceoverEnded] = useState(false);
  const [isSoundFXEnded, setIsSoundFXEnded] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isMusicEnded, setIsMusicEnded] = useState(false);

  // Volume constants
  const videoVolume = 1;
  const voiceoverVolume = 1;
  const musicVolume = 1;
  const soundFXVolume = 1;

  // Play/pause logic
  useEffect(() => {
    if (!isReady) return;

    const playOrPause = (media: HTMLMediaElement | null, isEnded: boolean) => {
      if (!media) return;
      if (isPlaying && !isEnded) {
        void media.play();
      } else {
        media.pause();
      }
    };

    playOrPause(videoRef.current, isVideoEnded);
    playOrPause(voiceoverRef.current, isVoiceoverEnded);
    playOrPause(soundFXRef.current, isSoundFXEnded);
    playOrPause(musicRef.current, isMusicEnded);
  }, [
    isPlaying,
    isVideoEnded,
    isVoiceoverEnded,
    isSoundFXEnded,
    isMusicEnded,
    isReady,
  ]);

  // Event listeners for ended events
  useEffect(() => {
    const voiceover = voiceoverRef.current;
    const soundEffect = soundFXRef.current;
    const video = videoRef.current;
    const music = musicRef.current;

    const handleVoiceoverEnd = () => setIsVoiceoverEnded(true);
    const handleSoundFXEnd = () => setIsSoundFXEnded(true);
    const handleVideoEnd = () => setIsVideoEnded(true);
    const handleMusicEnd = () => setIsMusicEnded(true);

    voiceover?.addEventListener("ended", handleVoiceoverEnd);
    soundEffect?.addEventListener("ended", handleSoundFXEnd);
    video?.addEventListener("ended", handleVideoEnd);
    music?.addEventListener("ended", handleMusicEnd);

    return () => {
      voiceover?.removeEventListener("ended", handleVoiceoverEnd);
      soundEffect?.removeEventListener("ended", handleSoundFXEnd);
      video?.removeEventListener("ended", handleVideoEnd);
      music?.removeEventListener("ended", handleMusicEnd);
    };
  }, []);

  // Set volumes
  useEffect(() => {
    const video = videoRef.current;
    const voiceover = voiceoverRef.current;
    const soundEffect = soundFXRef.current;
    const music = musicRef.current;

    if (video) video.volume = videoVolume;
    if (voiceover) voiceover.volume = voiceoverVolume;
    if (soundEffect) soundEffect.volume = soundFXVolume;
    if (music) music.volume = musicVolume;
  }, [videoVolume, soundFXVolume, voiceoverVolume, musicVolume]);

  // Duration timer
  useEffect(() => {
    if (isPlaying) {
      durationTimer.current = setInterval(() => {
        currentTime.current += 0.1;

        if (currentTime.current >= duration) {
          clearInterval(durationTimer.current!);
          handleEnded();
        }
      }, 100);
    }

    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    };
  }, [isPlaying, duration]);

  const handleEnded = () => {
    if (soundFXRef.current) {
      soundFXRef.current.currentTime = 0;
    }
    if (voiceoverRef.current) {
      voiceoverRef.current.currentTime = 0;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    currentTime.current = 0;

    setIsVoiceoverEnded(false);
    setIsSoundFXEnded(false);
    setIsVideoEnded(false);
    setIsMusicEnded(false);

    onPlayingChange?.(false);
  };

  return (
    <>
      <video
        className="absolute inset-0 w-full h-full object-contain"
        src={url}
        controls={false}
        ref={videoRef}
        onLoadedMetadata={updateCanvasSize}
      >
        <track kind="captions" />
      </video>
      {voiceoverSrc && (
        <audio
          ref={voiceoverRef}
          src={voiceoverSrc}
        >
          <track kind="captions" />
        </audio>
      )}
      {soundEffectSrc && (
        <audio
          ref={soundFXRef}
          src={soundEffectSrc}
        >
          <track kind="captions" />
        </audio>
      )}
      {musicSrc && (
        <audio
          ref={musicRef}
          src={musicSrc}
        >
          <track kind="captions" />
        </audio>
      )}
    </>
  );
}
