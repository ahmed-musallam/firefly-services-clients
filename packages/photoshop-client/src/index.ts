/**
 * Adobe Photoshop API Client
 */

// Import Photoshop client
import * as PhotoshopClient from './generated/photoshop-client/index';

// Export the client
export { PhotoshopClient };

// Export the Axios instance for customization
export { PHOTOSHOP_AXIOS_INSTANCE } from './mutator/custom-photoshop-axios-instance';

// Export job polling utilities
export * from './extension';

// Re-export IMS client for convenience
export * from '@musallam/ims-client';
