/**
 * Adobe Cloud Storage and Collaboration API Client
 */

// Import Storage and Collaboration client
import * as StorageAndCollaborationClient from './generated/storage-and-collaboration-client/index';

// Export the client
export { StorageAndCollaborationClient };

// Export the Axios instance for customization
export { STORAGE_AXIOS_INSTANCE } from './mutator/custom-storage-axios-instance';

// Export job polling utilities
export * from './extension';

// Re-export IMS client for convenience
export * from '@musallam/ims-client';
