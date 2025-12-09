import { LIGHTROOM_AXIOS_INSTANCE } from '../mutator/custom-lightroom-axios-instance';
import type { AxiosRequestConfig } from 'axios';
import type { JobStatusLinkResponse, LrJobApiResponse } from '../generated/lightroom-client';

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
  onProgress?: (status: LrJobApiResponse) => void;
  /**
   * Custom timeout in milliseconds (overrides maxAttempts)
   */
  timeoutMs?: number;
}

export class PollingError extends Error {
  constructor(
    message: string,
    public readonly status?: LrJobApiResponse,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PollingError';
  }
}

export class PollingTimeoutError extends PollingError {
  constructor(message: string, status?: LrJobApiResponse) {
    super(message, status);
    this.name = 'PollingTimeoutError';
  }
}

/**
 * Polls a Lightroom async job until completion
 *
 * @param jobResult - The job result containing a statusUrl from the initial async response
 * @param options - Polling configuration options
 * @returns The final job status when succeeded
 * @throws {PollingTimeoutError} If max attempts or timeout is reached
 * @throws {PollingError} If the job fails
 *
 * @example
 * ```typescript
 * const jobResponse = await LightroomClient.autoTone({ inputs, outputs });
 * const result = await pollLightroomJob(jobResponse, {
 *   axiosRequestConfig: { headers },
 *   onProgress: (status) => console.log(`Status: ${status.outputs?.[0]?.status}`)
 * });
 * console.log('Output:', result.outputs?.[0]?._links?.self?.href);
 * ```
 */
export async function pollLightroomJob(
  jobResult: JobStatusLinkResponse,
  options: PollLightroomJobOptions = {}
): Promise<LrJobApiResponse> {
  const statusUrl = jobResult._links?.self?.href;

  if (!statusUrl) {
    throw new PollingError('No status URL found in job result (_links.self.href)');
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
      const response = await LIGHTROOM_AXIOS_INSTANCE.get<LrJobApiResponse>(
        statusUrl,
        axiosRequestConfig
      );
      const status = response.data;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check if all outputs are in a terminal state
      const allOutputs = status.outputs || [];
      if (allOutputs.length === 0) {
        // No outputs yet, keep polling
        await sleep(intervalMs);
        continue;
      }

      const allSucceeded = allOutputs.every((output) => output.status === 'succeeded');
      const anyFailed = allOutputs.some((output) => output.status === 'failed');

      if (allSucceeded) {
        return status;
      }

      if (anyFailed) {
        const failedOutput = allOutputs.find((output) => output.status === 'failed');
        throw new PollingError(`Job failed: ${failedOutput?.details || 'Unknown error'}`, status);
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
