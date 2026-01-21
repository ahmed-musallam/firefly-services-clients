/**
 * Adobe Dynamic Graphics Render API Client
 */

// Import Dynamic Graphics Render client
import * as DynamicGraphicsRenderClient from './generated/dynamic-graphics-render-client/index';

// Export the client
export { DynamicGraphicsRenderClient };

// Export the Axios instance for customization
export { DYNAMIC_GRAPHICS_AXIOS_INSTANCE } from './mutator/custom-dynamic-graphics-axios-instance';

// Export job polling utilities
export * from './extension';

// Re-export IMS client for convenience
export * from '@musallam/ims-client';
