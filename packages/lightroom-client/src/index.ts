/**
 * Adobe Lightroom API Client
 */

// Import Lightroom client
import * as LightroomClient from './generated/lightroom-client/index';

// Export the client
export { LightroomClient };

// Export the Axios instance for customization
export { LIGHTROOM_AXIOS_INSTANCE } from './mutator/custom-lightroom-axios-instance';

// Export job polling utilities
export * from './extension';

// Re-export IMS client for convenience
export * from '@musallam/ims-client';
