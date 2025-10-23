/**
 * Types for video generation operations
 * References: .cursor/schema/generate_video_api.json
 */

import type {
  CameraMotionType,
  PromptStyleType,
  ShotAngleType,
  ShotSizeType,
} from "../constants";

export type GenerateVideoV3AsyncRequest = {
  // See OpenAPI: #/components/schemas/GenerateVideoRequestV3
  prompt?: string;
  bitRateFactor?: number; // 0-63, default 18
  image?: {
    conditions?: Array<{
      source: {
        uploadId?: string;
        url?: string;
        creativeCloudFileId?: string;
      };
      placement: {
        position: number; // 0-1, 0 = first frame, 1 = last frame
      };
    }>;
  };
  seeds?: number[]; // max 1 seed currently supported
  sizes?: Array<{
    width: number;
    height: number;
  }>;
  videoSettings?: {
    cameraMotion?: CameraMotionType;
    promptStyle?: PromptStyleType;
    shotAngle?: ShotAngleType;
    shotSize?: ShotSizeType;
  };
};

export type GenerateVideoV3AsyncResponse = {
  // See OpenAPI: 202 response for /v3/videos/generate
  jobId: string;
  statusUrl: string;
  cancelUrl: string;
};
