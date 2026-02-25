/**
 * @musallam/audio-video-client
 * TypeScript client library for Adobe Audio and Video API
 */

// Import Audio and Video API client
import * as AudioVideoApiClient from './generated/audio-video-api-client/index';

// Export generated client
export { AudioVideoApiClient };

// Export custom Axios instance for advanced configuration
export {
  AUDIO_VIDEO_AXIOS_INSTANCE,
  customAudioVideoAxiosInstance,
} from './mutator/custom-audio-video-axios-instance';

// Export polling utilities
export * from './extension';

// Re-export IMS client for convenience
export * from '@musallam/ims-client';
