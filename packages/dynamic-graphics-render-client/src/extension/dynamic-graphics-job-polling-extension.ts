import { DYNAMIC_GRAPHICS_AXIOS_INSTANCE } from '../mutator/custom-dynamic-graphics-axios-instance';
import type { AxiosRequestConfig } from 'axios';
import type {
  TemplateDescribeResponse,
  TemplateRenderResponse,
  JobStatus,
} from '../generated/dynamic-graphics-render-client';

/**
 * Polling utilities for async Dynamic Graphics Render jobs
 */

export interface PollDynamicGraphicsJobOptions {
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
  onProgress?: (status: JobStatus) => void;
  /**
   * Custom timeout in milliseconds (overrides maxAttempts)
   */
  timeoutMs?: number;
}

export class PollingError extends Error {
  public readonly statusJson: string;
  constructor(
    message: string,
    public readonly status?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.statusJson = JSON.stringify(status);
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
 * Polls a Dynamic Graphics Render async job until completion
 *
 * @param jobResult - The job result containing jobId and statusUrl from the initial async response
 * @param options - Polling configuration options
 * @returns The final job status when succeeded
 * @throws {PollingTimeoutError} If max attempts or timeout is reached
 * @throws {PollingError} If the job fails
 *
 * @example
 * ```typescript
 * const jobResponse = await DynamicGraphicsRenderClient.templateRender({ source, variations });
 * const result = await pollDynamicGraphicsJob(jobResponse, {
 *   axiosRequestConfig: { headers },
 *   onProgress: (status) => console.log(`Status: ${status.status}, Progress: ${status.percentCompleted}%`)
 * });
 * console.log('Outputs:', result.outputs);
 * ```
 */
export async function pollDynamicGraphicsJob(
  jobResult: TemplateDescribeResponse | TemplateRenderResponse,
  options: PollDynamicGraphicsJobOptions = {}
): Promise<JobStatus> {
  const { jobId } = jobResult;

  if (!jobId) {
    throw new PollingError('No job ID found in job result');
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
      const response = await DYNAMIC_GRAPHICS_AXIOS_INSTANCE.get<JobStatus>(
        `/beta/status/${jobId}`,
        axiosRequestConfig
      );
      const status = response.data;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check job status
      if (status.status === 'succeeded') {
        return status;
      }

      if (status.status === 'partially_succeeded') {
        // Return the result with partial success - caller can decide what to do
        return status;
      }

      if (status.status === 'failed') {
        const errorMessage = status.message || 'Unknown error';
        throw new PollingError(`Job failed: ${errorMessage}`, JSON.stringify(status));
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
 * Utility function to sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
