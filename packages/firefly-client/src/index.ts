/**
 * Adobe Firefly Services API Client
 * Export each client under its own namespace to avoid type conflicts
 */

// Import all Firefly clients
import * as FireflyApiClient from './generated/firefly-api-client';

// Export under namespaces to avoid type conflicts
export { FireflyApiClient };

// Export the Axios instance for customization
export { FIREFLY_AXIOS_INSTANCE } from './mutator/custom-firefly-axios-instance';

// Export job polling utilities
export * from './extension/index';

// Re-export IMS client for convenience
export * from '@musallam/ims-client';
