import type { StorageAndCollaborationClient } from '..';
import { STORAGE_AXIOS_INSTANCE } from '../mutator/custom-storage-axios-instance';
import type { AxiosRequestConfig } from 'axios';

/**
 * Polling utilities for async Storage and Collaboration jobs
 */

export interface PollStorageJobOptions {
  /**
   * Authentication and other fetch options
   */
  axiosRequestConfig?: AxiosRequestConfig;
  /**
   * Interval between polling attempts in milliseconds
   * @default 2000
   */
  intervalMs?: number;
  /**
   * Maximum number of polling attempts
   * @default 60
   */
  maxAttempts?: number;
  /**
   * Callback for progress updates
   */
  onProgress?: (status: StorageAndCollaborationClient.JobStatus) => void;
  /**
   * Custom timeout in milliseconds (overrides maxAttempts)
   */
  timeoutMs?: number;
}

export class PollingError extends Error {
  constructor(
    message: string,
    public readonly status?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PollingError';
  }
}

export class PollingTimeoutError extends PollingError {
  constructor(message: string, status?: string) {
    super(message, status);
    this.name = 'PollingTimeoutError';
  }
}

/**
 * Polls a Storage and Collaboration async job until completion
 *
 * @param jobId - The job ID from the initial async response
 * @param options - Polling configuration options
 * @returns The final job status when succeeded
 * @throws {PollingTimeoutError} If max attempts or timeout is reached
 * @throws {PollingError} If the job fails
 *
 * @example
 * ```typescript
 * const result = await pollStorageJob(jobId, { axiosRequestConfig: { headers } });
 * ```
 */
export async function pollStorageJob(
  jobId: string,
  options: PollStorageJobOptions = {}
): Promise<StorageAndCollaborationClient.JobStatus> {
  const {
    axiosRequestConfig = {},
    intervalMs = 2000,
    maxAttempts = 60,
    onProgress,
    timeoutMs,
  } = options;

  const startTime = Date.now();
  const effectiveTimeout = timeoutMs ?? maxAttempts * intervalMs;
  let attempts = 0;

  while (true) {
    attempts++;

    // Check timeout
    const elapsed = Date.now() - startTime;
    if (elapsed >= effectiveTimeout) {
      throw new PollingTimeoutError(`Polling timeout after ${elapsed}ms (${attempts} attempts)`);
    }

    try {
      const response = await STORAGE_AXIOS_INSTANCE.get(`/status/${jobId}`, axiosRequestConfig);
      const status = response.data as StorageAndCollaborationClient.JobStatus;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check terminal states
      if (status.status === 'succeeded') {
        return status;
      }

      if (status.status === 'failed') {
        const failedStatus = status as StorageAndCollaborationClient.FailedJobStatus;
        throw new PollingError(
          `Job failed: ${failedStatus.errors?.[0]?.error_code || 'unknown'} - ${
            failedStatus.errors?.[0]?.message || 'No message'
          }`,
          JSON.stringify(status)
        );
      }

      // Job still running, wait before next poll
      await sleep(intervalMs);
    } catch (error) {
      // Re-throw our custom errors
      if (error instanceof PollingError) {
        throw error;
      }

      // Wrap other errors
      throw new PollingError(
        `Failed to poll job status: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        error
      );
    }
  }
}

/**
 * Utility function to sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
