import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Настройки для различных соотношений сторон
Config.setComposition({
  id: "video-16-9",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 30 * 30, // 30 секунд по умолчанию
});

Config.setComposition({
  id: "video-9-16",
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 30 * 30,
});

Config.setComposition({
  id: "video-1-1",
  width: 1080,
  height: 1080,
  fps: 30,
  durationInFrames: 30 * 30,
});

Config.setComposition({
  id: "video-4-3",
  width: 1440,
  height: 1080,
  fps: 30,
  durationInFrames: 30 * 30,
});
