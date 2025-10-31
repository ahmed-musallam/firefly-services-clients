import { AXIOS_INSTANCE } from '../mutator/custom-axios-instance';
import type { AxiosRequestConfig } from 'axios';

/**
 * Polling utilities for async Firefly jobs
 */

export interface PollOptions<TResult = unknown> {
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
  onProgress?: (status: JobStatus<TResult>) => void;
  /**
   * Custom timeout in milliseconds (overrides maxAttempts)
   */
  timeoutMs?: number;
}

export interface JobStatus<TResult = unknown> {
  jobId: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'canceled';
  progress?: number;
  result?: TResult;
}

export class PollingError extends Error {
  constructor(
    message: string,
    public readonly status?: JobStatus,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PollingError';
  }
}

export class PollingTimeoutError extends PollingError {
  constructor(message: string, status?: JobStatus) {
    super(message, status);
    this.name = 'PollingTimeoutError';
  }
}

/**
 * Polls a Firefly async job until completion
 *
 * @param jobResult - The job result containing a statusUrl from the initial async response
 * @param options - Polling configuration options
 * @returns The final job result when succeeded, with type automatically inferred from the job response
 * @throws {PollingTimeoutError} If max attempts or timeout is reached
 * @throws {PollingError} If the job fails or is canceled
 *
 * @example
 * ```typescript
 * // Type is automatically inferred as GenerateImagesResponseV3
 * const result = await pollJob(imageJob, { fetchOptions: { headers } });
 *
 * // Type is automatically inferred as video result type
 * const videoResult = await pollJob(videoJob, { fetchOptions: { headers } });
 * ```
 */
export async function pollJob<TResult>(
  jobResult: { statusUrl: string },
  options: PollOptions<TResult> = {}
): Promise<TResult> {
  const { statusUrl } = jobResult;
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
      const response = await AXIOS_INSTANCE.get<JobStatus<TResult>>(statusUrl, axiosRequestConfig);

      const status = response.data;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check terminal states
      if (status.status === 'succeeded') {
        return status.result as TResult;
      }

      if (status.status === 'failed') {
        throw new PollingError(`Job failed: ${JSON.stringify(status)}`, status);
      }

      if (status.status === 'canceled') {
        throw new PollingError(`Job was canceled`, status);
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
