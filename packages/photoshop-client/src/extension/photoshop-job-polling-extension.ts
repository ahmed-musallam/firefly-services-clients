import type { PhotoshopClient } from '..';
import { PHOTOSHOP_AXIOS_INSTANCE } from '../mutator/custom-photoshop-axios-instance';
import type { AxiosRequestConfig } from 'axios';

/**
 * Polling utilities for async Photoshop jobs
 */

export interface PollPhotoshopJobOptions<TResult = unknown> {
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
  onProgress?: (status: PhotoshopJobStatus<TResult>) => void;
  /**
   * Custom timeout in milliseconds (overrides maxAttempts)
   */
  timeoutMs?: number;
}

export interface PhotoshopJobStatus<TResult = unknown> {
  jobId?: string;
  status: 'not_started' | 'running' | 'succeeded' | 'failed';
  created?: string;
  modified?: string;
  error_code?: string;
  message?: string;
  result?: TResult;
}

export class PollingError extends Error {
  constructor(
    message: string,
    public readonly status?: PhotoshopJobStatus,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PollingError';
  }
}

export class PollingTimeoutError extends PollingError {
  constructor(message: string, status?: PhotoshopJobStatus) {
    super(message, status);
    this.name = 'PollingTimeoutError';
  }
}

/**
 * Polls a Photoshop async job until completion
 *
 * @param jobResult - The job result containing a jobId from the initial async response
 * @param options - Polling configuration options
 * @returns The final job result when succeeded, with type automatically inferred from the job response
 * @throws {PollingTimeoutError} If max attempts or timeout is reached
 * @throws {PollingError} If the job fails
 *
 * @example
 * ```typescript
 * // Type is automatically inferred as MaskObjectsJobApiResponse
 * const result = await pollPhotoshopJob(maskJob, { axiosRequestConfig: { headers } });
 *
 * // Type is automatically inferred as document result type
 * const docResult = await pollPhotoshopJob(docJob, { axiosRequestConfig: { headers } });
 * ```
 */
export async function pollPhotoshopJob<TResult>(
  jobResult: { jobId: string; statusUrl?: string },
  options: PollPhotoshopJobOptions<TResult> = {}
): Promise<TResult> {
  const { jobId } = jobResult;
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
      // Use the getJobStatus endpoint
      const response = await PHOTOSHOP_AXIOS_INSTANCE.get(
        `/sensei/status/${jobId}`,
        axiosRequestConfig
      );

      const status = response.data as PhotoshopJobStatus<TResult>;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check terminal states
      if (status.status === 'succeeded') {
        // For succeeded jobs, the entire response is the result
        return status as unknown as TResult;
      }

      if (status.status === 'failed') {
        throw new PollingError(
          `Job failed: ${status.error_code || 'unknown'} - ${status.message || 'No message'}`,
          status
        );
      }

      // Job still running (not_started or running), wait before next poll
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
 * Polls a mask objects job until completion
 */
export async function pollMaskObjectsJob(
  jobResult: { jobId: string; statusUrl?: string },
  options: PollPhotoshopJobOptions<PhotoshopClient.MaskObjectsJobApiResponse> = {}
): Promise<PhotoshopClient.MaskObjectsJobApiResponse> {
  return pollPhotoshopJob<PhotoshopClient.MaskObjectsJobApiResponse>(jobResult, options);
}

/**
 * Polls a mask body parts job until completion
 */
export async function pollMaskBodyPartsJob(
  jobResult: { jobId: string; statusUrl?: string },
  options: PollPhotoshopJobOptions<PhotoshopClient.MaskBodyPartsJobApiResponse> = {}
): Promise<PhotoshopClient.MaskBodyPartsJobApiResponse> {
  return pollPhotoshopJob<PhotoshopClient.MaskBodyPartsJobApiResponse>(jobResult, options);
}

/**
 * Polls a refine mask job until completion
 */
export async function pollRefineMaskJob(
  jobResult: { jobId: string; statusUrl?: string },
  options: PollPhotoshopJobOptions<PhotoshopClient.RefineMaskJobApiResponse> = {}
): Promise<PhotoshopClient.RefineMaskJobApiResponse> {
  return pollPhotoshopJob<PhotoshopClient.RefineMaskJobApiResponse>(jobResult, options);
}

/**
 * Polls a fill masked areas job until completion
 */
export async function pollFillMaskedAreasJob(
  jobResult: { jobId: string; statusUrl?: string },
  options: PollPhotoshopJobOptions<PhotoshopClient.FillMaskedAreasJobApiResponse> = {}
): Promise<PhotoshopClient.FillMaskedAreasJobApiResponse> {
  return pollPhotoshopJob<PhotoshopClient.FillMaskedAreasJobApiResponse>(jobResult, options);
}

/**
 * Polls a remove background job until completion
 */
export async function pollRemoveBackgroundJob(
  jobResult: { jobId: string; statusUrl?: string },
  options: PollPhotoshopJobOptions<PhotoshopClient.SenseiJobApiResponse> = {}
): Promise<PhotoshopClient.SenseiJobApiResponse> {
  return pollPhotoshopJob<PhotoshopClient.SenseiJobApiResponse>(jobResult, options);
}

/**
 * Polls a document manifest job until completion
 */
export async function pollDocumentManifestJob(
  jobResult: { jobId: string; statusUrl?: string },
  options: PollPhotoshopJobOptions<PhotoshopClient.ManifestJobApiResponse> = {}
): Promise<PhotoshopClient.ManifestJobApiResponse> {
  return pollPhotoshopJob<PhotoshopClient.ManifestJobApiResponse>(jobResult, options);
}

/**
 * Polls a Photoshop job (document operations like create, modify, rendition, etc.)
 */
export async function pollPsJob(
  jobResult: { jobId: string; statusUrl?: string },
  options: PollPhotoshopJobOptions<PhotoshopClient.PsJobApiResponse> = {}
): Promise<PhotoshopClient.PsJobApiResponse> {
  return pollPhotoshopJob<PhotoshopClient.PsJobApiResponse>(jobResult, options);
}

/**
 * Utility function to sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
