/**
 * Firefly API Client - Main export
 *
 * Re-exports all types, constants, and the main FireflyClient class.
 */

// Export the main client
export { FireflyClient } from './firefly-client';

// Export all constants
export {
  CameraMotion,
  PromptStyle,
  ShotAngle,
  ShotSize,
  ModelVersion,
  VideoModelVersion,
  JobStatus,
} from './constants';

// Export constant types

export type {
  CameraMotionType,
  PromptStyleType,
  ShotAngleType,
  ShotSizeType,
  ModelVersionType,
  VideoModelVersionType,
  JobStatusType,
} from './constants';

export type {
  // Export all types
  FireflyClientOptions,
} from './types/common';

export type {
  GenerateImagesV3AsyncRequest,
  GenerateImagesV3AsyncResponse,
  GenerateImageJobResponse,
} from './types/generate-images';

export type { UploadImageResponse } from './types/upload-image';

export type {
  GenerateVideoV3AsyncRequest,
  GenerateVideoV3AsyncResponse,
} from './types/generate-video';

export type { ExpandImageV3AsyncRequest, ExpandImageV3AsyncResponse } from './types/expand-image';

export type { FillImageV3AsyncRequest, FillImageV3AsyncResponse } from './types/fill-image';

export type {
  GenerateSimilarImagesV3AsyncRequest,
  GenerateSimilarImagesV3AsyncResponse,
} from './types/generate-similar';

export type {
  GenerateObjectCompositeV3AsyncRequest,
  GenerateObjectCompositeV3AsyncResponse,
} from './types/generate-object-composite';
