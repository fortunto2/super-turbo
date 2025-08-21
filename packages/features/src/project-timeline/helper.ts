import type { IFileRead } from "@turbo-super/api";
import { FileTypeEnum } from "@turbo-super/api";

// Временная заглушка для типа из super-timeline
type ItemType = "image" | "video" | "audio" | "text";

// Экспортируем типы для использования в других файлах
export type { ItemType };

export const mediaTypeMap = {
  [FileTypeEnum.IMAGE]: "image",
  [FileTypeEnum.VIDEO]: "video",
  [FileTypeEnum.VOICEOVER]: "audio",
  [FileTypeEnum.SOUND_EFFECT]: "audio",
  [FileTypeEnum.AUDIO]: "audio",
  [FileTypeEnum.MUSIC]: "audio",
  [FileTypeEnum.TEXT]: "text",
  [FileTypeEnum.OTHER]: "text",
};

type TrackItemProps = {
  file: IFileRead;
  duration: number;
  from: number;
  id?: string;
};

type TrackItemDetailsProps = {
  text?: string;
  file: IFileRead;
  textDetails?: any;
  size?: {
    width: number | string;
    height: number | string;
  };
};

const createMusicTrackItem = ({ duration, file, from }: TrackItemProps) => {
  const fileDurationMs = file.duration ? file.duration * 1000 : duration;

  const trimTo = Math.min(fileDurationMs, duration);
  const displayTo = from + trimTo;

  return {
    id: file.id,
    name: "",
    type: "audio",
    display: {
      from,
      to: displayTo,
    },
    trim: {
      from: 0,
      to: trimTo,
    },
    isMain: false,
    details: {
      src: file.url,
      duration: fileDurationMs,
      volume: 100,
      text: file.type,
    },
  };
};

const createImageTrackItem = ({ duration, file, from }: TrackItemProps) => {
  return {
    id: file.id,
    type: "image",
    name: "",
    display: {
      from,
      to: from + duration,
    },
    metadata: {},
    isMain: false,
    details: {
      src: file.url,
      // width: 1280,
      // height: 1920,
      opacity: 100,
      // transform: "scale(0.84375)",
      border: "none",
      borderRadius: "0",
      boxShadow: "none",
      top: "0px",
      // left: "-100px",
    },
  };
};

const createVideoTrackItem = ({ duration, file, from }: TrackItemProps) => {
  const fileDurationMs = file.duration ? file.duration * 1000 : duration;

  return {
    id: file.id,
    type: "video",
    preview: file.thumbnail_url,
    display: {
      from,
      to: from + duration,
    },
    trim: {
      from: 0,
      to: fileDurationMs,
    },
    isMain: false,
    details: {
      width: 1280,
      height: 720,
      duration: fileDurationMs,
      src: file.url,
      volume: 100,
      top: "600px",
      left: "-100px",
      text: "Scene",
    },
  };
};

const createTextTrackItem = ({ duration, from, id }: TrackItemProps) => {
  return {
    id,
    name: "",
    type: "text",
    display: { from, to: from + duration },
    metadata: {},
    isMain: false,
  };
};

const trackItemTrackMap = {
  [FileTypeEnum.IMAGE]: createImageTrackItem,
  [FileTypeEnum.VIDEO]: createVideoTrackItem,
  [FileTypeEnum.VOICEOVER]: createMusicTrackItem,
  [FileTypeEnum.SOUND_EFFECT]: createMusicTrackItem,
  [FileTypeEnum.AUDIO]: createMusicTrackItem,
  [FileTypeEnum.MUSIC]: createMusicTrackItem,
  [FileTypeEnum.TEXT]: createTextTrackItem,
  [FileTypeEnum.OTHER]: createTextTrackItem,
};

const createMusicDetails = ({ file }: TrackItemDetailsProps) => {
  return {
    type: "audio",
    details: {
      src: file.url,
      duration: file.duration ? file.duration * 1000 : null,
      volume: 100,
      text: file.audio_generation?.prompt ?? file.type,
    },
  };
};

const createImageDetails = ({ file }: TrackItemDetailsProps) => {
  return {
    type: "image",
    details: {
      src: file.url,
      // width: 1280,
      // height: 1920,
      opacity: 100,
      // transform: "scale(0.84375)",
      border: "none",
      borderRadius: "0",
      boxShadow: "none",
      top: "0px",
      // left: "-100px",
    },
  };
};

const createVideoDetails = ({ file }: TrackItemDetailsProps) => {
  return {
    type: "video",
    details: {
      width: 1280,
      height: 720,
      src: file.url,
      volume: 100,
      top: "600px",
      left: "-100px",
      text: file.video_generation?.prompt?.length
        ? file.video_generation.prompt
        : "Video",
      duration: file.duration ? file.duration * 1000 : undefined,
    },
  };
};
const createTextDetails = ({
  text,
  textDetails,
  size,
}: TrackItemDetailsProps) => {
  const canvasWidth = Number(size?.width ?? 1920);
  const canvasHeight = Number(size?.height ?? 1080);

  const canvasSquare = canvasWidth * canvasHeight;
  const canvasSqrt = Math.round(Math.sqrt(canvasSquare) * 100) / 115;

  const fontSize = textDetails.fontSize
    ? Math.round((canvasSqrt / textDetails.fontSize) * 100) / 100
    : undefined;

  return {
    type: "text",
    details: {
      ...textDetails,
      fontFamily: "Roboto-Bold",
      fontSize: fontSize,
      text,
      opacity: 100,
      textAlign: textDetails.textAlign ?? "right",

      wordWrap: "break-word",
      wordBreak: "normal",
      WebkitTextStrokeColor: "#ffffff",
      WebkitTextStrokeWidth: "0px",
      top: `${textDetails.top * canvasHeight - (textDetails?.height * canvasHeight) / 2}px`,
      left: `${textDetails.left * canvasWidth - (textDetails?.width * canvasWidth) / 2}px`,
      width: textDetails.width * canvasWidth,
      height: textDetails.height * canvasHeight,
      fontUrl:
        "https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf",
    },
  };
};

const trackItemDetailsMap = {
  [FileTypeEnum.IMAGE]: createImageDetails,
  [FileTypeEnum.VIDEO]: createVideoDetails,
  [FileTypeEnum.VOICEOVER]: createMusicDetails,
  [FileTypeEnum.SOUND_EFFECT]: createMusicDetails,
  [FileTypeEnum.AUDIO]: createMusicDetails,
  [FileTypeEnum.MUSIC]: createMusicDetails,
  [FileTypeEnum.TEXT]: createTextDetails,
  [FileTypeEnum.OTHER]: createTextDetails,
};

export const createTrackItemMap = (type: FileTypeEnum) => {
  return trackItemTrackMap[type];
};

export const createTrackDetailsMap = (type: FileTypeEnum) => {
  return trackItemDetailsMap[type];
};

export const createTrack = (
  trackId: string,
  type: FileTypeEnum,
  items: string[]
) => {
  return {
    id: trackId,
    accepts: ["text", "audio", "helper", "video", "image"],
    type: mediaTypeMap[type] as ItemType,
    items,
    magnetic: false,
    static: false,
  };
};
