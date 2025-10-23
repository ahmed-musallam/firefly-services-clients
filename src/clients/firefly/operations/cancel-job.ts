/**
 * Job cancellation operation
 */

import type { IIMSClient } from '../../ims/ims-client.interface';

export async function cancelJob(
  imsClient: IIMSClient,
  baseUrl: string,
  jobID: string
): Promise<void> {
  const url = `${baseUrl}/v3/cancel/${jobID}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: await imsClient.getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Firefly cancelJob failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
}
