import { LIGHTROOM_AXIOS_INSTANCE } from '../mutator/custom-lightroom-axios-instance';
import type { AxiosRequestConfig } from 'axios';

/**
 * Polling utilities for async Lightroom jobs
 */

export interface PollLightroomJobOptions {
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
  onProgress?: (status: LightroomJobStatus) => void;
  /**
   * Custom timeout in milliseconds (overrides maxAttempts)
   */
  timeoutMs?: number;
}

export interface LightroomJobStatus {
  jobId?: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  created?: string;
  modified?: string;
  outputs?: Array<{
    href?: string;
    storage?: string;
  }>;
  error?: {
    code?: string;
    message?: string;
  };
}

export class PollingError extends Error {
  constructor(
    message: string,
    public readonly status?: LightroomJobStatus,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PollingError';
  }
}

export class PollingTimeoutError extends PollingError {
  constructor(message: string, status?: LightroomJobStatus) {
    super(message, status);
    this.name = 'PollingTimeoutError';
  }
}

/**
 * Polls a Lightroom async job until completion
 *
 * @param jobResult - The job result containing a statusUrl or jobId from the initial async response
 * @param options - Polling configuration options
 * @returns The final job status when succeeded
 * @throws {PollingTimeoutError} If max attempts or timeout is reached
 * @throws {PollingError} If the job fails
 *
 * @example
 * ```typescript
 * const result = await pollLightroomJob(jobResult, { axiosRequestConfig: { headers } });
 * ```
 */
export async function pollLightroomJob(
  jobResult: { _links?: { self?: { href?: string } } },
  options: PollLightroomJobOptions = {}
): Promise<LightroomJobStatus> {
  const statusUrl = jobResult._links?.self?.href;

  if (!statusUrl) {
    throw new PollingError('No status URL found in job result');
  }

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
      const response = await LIGHTROOM_AXIOS_INSTANCE.get(statusUrl, axiosRequestConfig);
      const status = response.data as LightroomJobStatus;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check terminal states
      if (status.status === 'succeeded') {
        return status;
      }

      if (status.status === 'failed') {
        throw new PollingError(
          `Job failed: ${status.error?.code || 'unknown'} - ${status.error?.message || 'No message'}`,
          status
        );
      }

      // Job still running (pending or running), wait before next poll
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
