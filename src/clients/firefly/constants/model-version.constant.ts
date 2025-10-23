export const ModelVersion = {
  IMAGE3: "image3",
  IMAGE3_CUSTOM: "image3_custom",
  IMAGE4_STANDARD: "image4_standard",
  IMAGE4_ULTRA: "image4_ultra",
  IMAGE4_CUSTOM: "image4_custom",
} as const;

export type ModelVersion = (typeof ModelVersion)[keyof typeof ModelVersion];

export const VideoModelVersion = {
  VIDEO1_STANDARD: "video1_standard",
} as const;

export type VideoModelVersion =
  (typeof VideoModelVersion)[keyof typeof VideoModelVersion];
