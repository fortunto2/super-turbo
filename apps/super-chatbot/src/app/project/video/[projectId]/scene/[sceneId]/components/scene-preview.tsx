import {
  Control,
  FabricCanvas,
  Layer,
  useMediaPrefetch,
} from "@turbo-super/features";
import { ToolType } from "./toolbar";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { FileTypeEnum, ISceneRead } from "@turbo-super/api";
import { EmptyPreview, ErrorMessage, Loader } from "./helper";
import { API_NEXT_ROUTES } from "@/lib/config/next-api-routes";

interface ScenePreviewProps {
  scene: ISceneRead | null;
  isLoading: boolean;
  error: string | null;
  activeTool: string | null;
  onActiveToolChange?: (tool: ToolType | null) => void;
  onPlayingChange?: (value: boolean) => void;
  onStarted: (id: string) => void;
  isPlaying?: boolean;
  projectId: string;
}

export const ScenePreview = ({
  scene,
  isLoading,
  error,
  activeTool,
  onActiveToolChange,
  onPlayingChange,
  onStarted,
  isPlaying,
  projectId,
}: ScenePreviewProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [canvas, setCanvas] = useState<any>(null);
  const [isInpainting, setIsInpainting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filesScene: any = useMemo(() => {
    // if (!scene || !project) return [];
    if (!scene) return [];
    return [
      { url: scene.voiceover?.url, type: FileTypeEnum.AUDIO },
      { url: scene.sound_effect?.url, type: FileTypeEnum.AUDIO },
      // { url: project.music?.file.url, type: FileTypeEnum.MUSIC },
      { url: scene.file?.url, type: FileTypeEnum.VIDEO },
    ].filter(({ url }) => url);
  }, [scene?.voiceover, scene?.sound_effect, scene?.file]);

  const { loaded: isReady } = useMediaPrefetch({ files: filesScene });

  const aspectRatio: number = useMemo(() => {
    const value = "16:9";
    const [width, height] = value.split(":").map(Number);
    return width / height;
  }, []);

  // Определяем размеры картинки для канваса
  const updateCanvasSize = () => {
    if (scene?.file?.type === FileTypeEnum.IMAGE) {
      const img = imgRef.current;
      const container = containerRef.current;
      const toolbar = toolbarRef.current;

      if (!img || !container) return;

      const naturalWidth = img.naturalWidth || 0;
      const naturalHeight = img.naturalHeight || 0;
      const containerWidth = container.clientWidth || 0;
      const containerHeight = container.clientHeight || 0;
      const toolbarWidth = toolbar?.clientWidth || 0;

      if (
        !naturalWidth ||
        !naturalHeight ||
        !containerWidth ||
        !containerHeight
      )
        return;

      const scale = Math.min(
        (containerWidth - toolbarWidth) / naturalWidth,
        containerHeight / naturalHeight
      );
      const width = Math.floor(naturalWidth * scale);
      const height = Math.floor(naturalHeight * scale);
      setCanvasSize({ width, height });
    } else if (scene?.file?.type === FileTypeEnum.VIDEO) {
      const video = videoRef.current;
      const container = containerRef.current;
      const toolbar = toolbarRef.current;
      if (!video || !container) return;

      // Для видео используем videoWidth/videoHeight если доступны, иначе offsetWidth/offsetHeight
      const naturalWidth = video.videoWidth || video.offsetWidth || 0;
      const naturalHeight = video.videoHeight || video.offsetHeight || 0;
      const containerWidth = container.clientWidth || 0;
      const containerHeight = container.clientHeight || 0;
      const toolbarWidth = toolbar?.clientWidth || 0;

      if (
        !naturalWidth ||
        !naturalHeight ||
        !containerWidth ||
        !containerHeight
      )
        return;

      const scale = Math.min(
        (containerWidth - toolbarWidth) / naturalWidth,
        containerHeight / naturalHeight
      );
      const width = Math.floor(naturalWidth * scale);
      const height = Math.floor(naturalHeight * scale);

      setCanvasSize({ width, height });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Recalculate when activeTool changes (container height may change)
  // Добавляем задержку для учета плавных переходов
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCanvasSize();
    }, 350); // 300ms анимация + 50ms буфер

    return () => clearTimeout(timer);
  }, [activeTool]);

  // Observe container size changes to recompute contain fit precisely
  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver(() => {
      // Добавляем задержку для учета плавных переходов
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateCanvasSize();
      }, 50); // Небольшая задержка для стабилизации размеров
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const containerHeight = useMemo(() => {
    return activeTool === null || activeTool === "inpainting" ? "100%" : "60%";
  }, [activeTool]);

  const handleInpainting = async (result: {
    prompt: string;
    mask: File;
    config: string;
  }) => {
    setIsInpainting(true);
    if (!scene || !scene.file?.url || !projectId) return;
    console.log(result);

    try {
      const formData = new FormData();
      formData.append("prompt", result.prompt);
      formData.append("mask", result.mask);
      formData.append("config", result.config);
      formData.append("generationType", "image-to-image");
      formData.append("mask", result.mask);
      formData.append("sourceImageId", scene?.file?.id!);
      formData.append("sourceImageUrl", scene?.file?.url!);
      formData.append("model", "comfyui/flux/inpainting");
      formData.append("projectId", projectId);
      formData.append("sceneId", scene.id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/${API_NEXT_ROUTES.GENERATE_IMAGE}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Inpainting response:", data);

      if (data.success) {
        onActiveToolChange?.("mediaList");
        if (data?.fileId) onStarted(data.fileId);
      }
    } catch (err) {
      console.error("Error during inpainting:", err);
      setIsInpainting(false);
    } finally {
      setIsInpainting(false);
    }
  };

  return (
    <div
      style={{ height: containerHeight }}
      className="flex items-center justify-center overflow-hidden rounded-lg bg-black relative gap-3 transition-[height] duration-300 ease-in-out"
      ref={containerRef}
    >
      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : scene?.file?.url ? (
        <div className="flex justify-center items-center w-full h-full">
          <div
            className="relative max-w-full"
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
            }}
          >
            {scene.file.type === FileTypeEnum.IMAGE ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scene.file.url}
                  alt={`Scene ${scene.id}`}
                  className="absolute inset-0 w-full h-full object-contain"
                  ref={imgRef}
                  onLoad={updateCanvasSize}
                />
              </>
            ) : scene.file.type === FileTypeEnum.VIDEO ? (
              <VideoPreview
                url={scene.file.url}
                onPlayingChange={onPlayingChange}
                duration={scene.duration!}
                isPlaying={isPlaying}
                musicSrc={scene.sound_effect?.url}
                soundEffectSrc={scene.sound_effect?.url}
                voiceoverSrc={scene?.voiceover?.url}
                isReady={isReady}
                videoRef={videoRef}
                updateCanvasSize={updateCanvasSize}
              />
            ) : (
              <></>
            )}
            <Layer
              active={activeTool === "inpainting"}
              setCanvas={setCanvas}
              imageUrl={scene.file.url}
            />
            {activeTool !== "inpainting" &&
              canvasSize.width > 0 &&
              canvasSize.height > 0 && (
                <FabricCanvas
                  className="absolute top-0 left-0"
                  initialObjects={scene.objects}
                  onReady={() => {}}
                  readonly={false}
                  width={canvasSize.width}
                  height={canvasSize.height}
                />
              )}
          </div>
        </div>
      ) : (
        <EmptyPreview />
      )}
      {activeTool === "inpainting" && (
        <div
          ref={toolbarRef}
          className="h-full w-full lg:w-96 lg:min-w-80 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <Control
            onGenerating={() => {
              setIsInpainting(true);
            }}
            isActive={activeTool === "inpainting"}
            canvas={canvas}
            setCanvas={setCanvas}
            onComplete={handleInpainting}
            loading={isLoading || isInpainting}
            initialPrompt=""
            onActiveChange={(tool: ToolType) => {
              onActiveToolChange?.(tool);
            }}
          />
        </div>
      )}
    </div>
  );
};

function VideoPreview({
  url,
  onPlayingChange,
  isPlaying,
  duration,
  musicSrc,
  soundEffectSrc,
  voiceoverSrc,
  isReady,
  videoRef,
  updateCanvasSize,
}: {
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
}) {
  const videoVolume = 1;
  const voiceoverVolume = 1;
  const musicVolume = 1;
  const soundFXVolume = 1;

  const voiceoverRef = useRef<HTMLAudioElement>(null);
  const soundFXRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);
  const currentTime = useRef(0);

  const [isVoiceoverEnded, setIsVoiceoverEnded] = useState(false);
  const [isSoundFXEnded, setIsSoundFXEnded] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isMusicEnded, setIsMusicEnded] = useState(false);

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
    // musicTrim,
  ]);

  useEffect(() => {
    const voiceover = voiceoverRef.current;
    const soundEffect = soundFXRef.current;
    const video = videoRef.current;
    const music = musicRef.current;

    const handleVoiceoverEnd = () => {
      setIsVoiceoverEnded(true);
    };
    const handleSoundFXEnd = () => {
      setIsSoundFXEnded(true);
    };
    const handleVideoEnd = () => {
      setIsVideoEnded(true);
    };
    const handleMusicEnd = () => {
      setIsMusicEnded(true);
    };

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

    // if (musicRef.current && musicTrim) {
    //   musicRef.current.currentTime = musicTrim.startDuration;
    // }

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
          // onLoadedMetadata={() => {
          //     if (musicRef.current && musicTrim) {
          //         musicRef.current.volume = musicVolume;
          //         // musicRef.current.currentTime =
          //         //     musicTrim.startDuration;
          //     }
          // }}
        >
          <track kind="captions" />
        </audio>
      )}
    </>
  );
}
