/**
 * Job status polling operation
 */

import type { IIMSClient } from "../../ims/ims-client.interface";
import type { GenerateImageJobResponse } from "../types/generate-images";

export async function getJobStatus(
  imsClient: IIMSClient,
  baseUrl: string,
  jobID: string,
): Promise<GenerateImageJobResponse> {
  const url = `${baseUrl}/v3/status/${jobID}`;
  const response = await fetch(url, {
    method: "GET",
    headers: await imsClient.getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Firefly getJobStatus failed: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }
  return (await response.json()) as GenerateImageJobResponse;
}
