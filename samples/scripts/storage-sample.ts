/**
 * Sample usage of the Storage and Collaboration Client
 * This demonstrates how to use the Adobe Cloud Storage and Collaboration API
 */

import {
  StorageAndCollaborationClient,
  STORAGE_AXIOS_INSTANCE,
  TokenIMSClient,
} from '@musallam/storage-and-collaboration-client';

// Configure authentication
const imsClient = new TokenIMSClient({
  clientId: process.env.ADOBE_CLIENT_ID!,
  clientSecret: process.env.ADOBE_CLIENT_SECRET!,
  scopes: ['openid', 'creative_sdk', 'AdobeID'],
});

// Setup axios instance with authentication
STORAGE_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = process.env.ADOBE_CLIENT_ID!;
  return config;
});

async function main() {
  try {
    console.log('Adobe Storage and Collaboration Client Sample\n');

    // Example 1: List projects
    console.log('1. Listing projects...');
    const projects = await StorageAndCollaborationClient.getProjects({
      limit: 10,
      sortBy: '-created',
    });
    console.log(`Found ${projects.items?.length || 0} projects`);
    if (projects.items && projects.items.length > 0) {
      console.log(`First project: ${projects.items[0].name} (${projects.items[0].assetId})\n`);
    }

    // Example 2: Create a new project
    console.log('2. Creating a new project...');
    const newProject = await StorageAndCollaborationClient.createProject({
      name: 'Sample Project from API',
    });
    console.log(`Created project: ${newProject.name} (${newProject.assetId})\n`);

    // Example 3: Get project details
    console.log('3. Getting project details...');
    const projectDetails = await StorageAndCollaborationClient.getProject({
      assetId: newProject.assetId,
    });
    console.log(`Project: ${projectDetails.name}`);
    console.log(`Created: ${projectDetails.createdDate}`);
    console.log(`State: ${projectDetails.state}\n`);

    // Example 4: Create a folder in the project
    console.log('4. Creating a folder...');
    const newFolder = await StorageAndCollaborationClient.createFolder({
      parentId: newProject.assetId,
      name: 'Sample Folder',
    });
    console.log(`Created folder: ${newFolder.name} (${newFolder.assetId})\n`);

    // Example 5: Get project children
    console.log('5. Listing project children...');
    const children = await StorageAndCollaborationClient.getProjectChildren({
      assetId: newProject.assetId,
      limit: 10,
    });
    console.log(`Found ${children.children?.length || 0} children in the project\n`);

    // Example 6: Get project permissions
    console.log('6. Getting project permissions...');
    const permissions = await StorageAndCollaborationClient.getProjectPermissions({
      assetId: newProject.assetId,
    });
    console.log(`Direct permissions: ${permissions.direct?.length || 0}`);
    console.log(`Pending permissions: ${permissions.pending?.length || 0}\n`);

    // Example 7: Get effective permission for current user
    console.log('7. Getting effective permission...');
    const effectivePermission = await StorageAndCollaborationClient.getProjectEffectivePermission({
      assetId: newProject.assetId,
    });
    console.log(`Your role: ${effectivePermission.role}\n`);

    // Example 8: Add a collaborator (uncomment and modify as needed)
    /*
    console.log('8. Adding a collaborator...');
    const patchResult = await StorageAndCollaborationClient.patchProjectPermissions(
      { assetId: newProject.assetId },
      {
        direct: {
          additions: [
            {
              recipient: 'mailto:collaborator@example.com',
              type: 'user',
              role: 'comment',
            },
          ],
        },
      }
    );
    console.log('Collaborator added\n');
    */

    // Example 9: File upload workflow (init, upload, finalize)
    console.log('9. Initiating file upload...');
    const uploadInit = await StorageAndCollaborationClient.initBlockBasedFileUpload({
      parentId: newFolder.assetId,
      name: 'sample-file.txt',
      mediaType: 'text/plain',
      size: 1024,
    });
    console.log(`Upload ID: ${uploadInit.uploadId}`);
    console.log(`Block size: ${uploadInit.blockSize} bytes`);
    console.log(`Transfer links: ${uploadInit.transferLinks?.length}\n`);

    // In a real scenario, you would upload blocks to the transfer URLs here
    // Then finalize the upload and poll for completion

    /*
    const finalizeResponse = await StorageAndCollaborationClient.finalizeBlockBasedFileUpload({
      uploadId: uploadInit.uploadId,
      usedTransferLinks: [1], // Array of part numbers that were uploaded
    });
    
    // Poll the job until completion
    const fileResult = await pollStorageJob(finalizeResponse.jobId, {
      onProgress: (status) => {
        console.log(`Job status: ${status.status}`);
      },
    });
    console.log('File upload complete!\n');
    */

    // Example 10: Discard (soft delete) the project
    console.log('10. Discarding the project...');
    const discardedProject = await StorageAndCollaborationClient.discardProject({
      assetId: newProject.assetId,
    });
    console.log(`Project discarded: ${discardedProject.state}\n`);

    console.log('✓ All operations completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
  }
}

main();
