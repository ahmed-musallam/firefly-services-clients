/**
 * Adobe Firefly Services API Client
 * Export each client under its own namespace to avoid type conflicts
 */

// Import all Firefly clients
import * as ImageGenerationClient from './generated/image-generation-async-v3-client/index';
import * as GenerateSimilarClient from './generated/generate-similar-async-v3-client/index';
import * as GenerateObjectCompositeClient from './generated/generate-object-composite-async-v3-client/index';
import * as GenerativeExpandClient from './generated/generative-expand-async-v3-client/index';
import * as GenerativeFillClient from './generated/generative-fill-async-v3-client/index';
import * as GenerateVideoClient from './generated/generate-video-api-client/index';
import * as UploadImageClient from './generated/upload-image-client/index';
import * as CustomModelsClient from './generated/custom-models-listing-client/index';

// Export under namespaces to avoid type conflicts
export {
  ImageGenerationClient,
  GenerateSimilarClient,
  GenerateObjectCompositeClient,
  GenerativeExpandClient,
  GenerativeFillClient,
  GenerateVideoClient,
  UploadImageClient,
  CustomModelsClient,
};

// Export the Axios instance for customization
export { FIREFLY_AXIOS_INSTANCE } from './mutator/custom-firefly-axios-instance';

// Export job polling utilities
export * from './extension/index';

// Re-export IMS client for convenience
export * from '@musallam/ims-client';
