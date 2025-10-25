/**
 * Export each client under its own namespace to avoid type conflicts
 */

// Import all clients
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

// Also export extensionsclear

export * from './extension/index';

// Export IMS clients for authentication
export { IMSClient } from './ims/default-ims-client';
export { TokenIMSClient } from './ims/token-ims-clielt';
export type { IIMSClient, IMSClientOptions } from './ims/ims-client.interface';
