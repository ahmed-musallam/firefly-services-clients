/**
 * Polling utilities for async Audio and Video API jobs
 *
 * This module provides a unified polling mechanism that works with ALL job types
 * in the Adobe Audio and Video API:
 *
 * - **Template jobs**: templateDescribe(), templateRender()
 * - **Speech generation**: generateSpeech()
 * - **Transcription**: transcribe()
 * - **Dubbing**: dub()
 * - **Avatar generation**: generateAvatar()
 * - **Video reframing**: generateReframedVideo(), generateReframedVideoV2()
 *
 * The polling function automatically determines the correct status endpoint
 * and handles different response formats for each job type.
 */

import { AUDIO_VIDEO_AXIOS_INSTANCE } from '../mutator/custom-audio-video-axios-instance';
import type { AxiosRequestConfig } from 'axios';
import type {
  TemplateDescribeResponse,
  TemplateRenderResponse,
  SubmitAPIResponse,
  JobStatusLinkResponse,
  GenerateReframedVideo202,
  GenerateReframedVideoV2202,
  StatusAPIResponse,
  JobResultV2200,
  FireflyJobApiResponse,
} from '../generated/audio-video-api-client';

/**
 * Union type of all possible job responses from Audio and Video API
 */
export type AudioVideoJobResponse =
  | TemplateDescribeResponse
  | TemplateRenderResponse
  | SubmitAPIResponse
  | JobStatusLinkResponse
  | GenerateReframedVideo202
  | GenerateReframedVideoV2202;

/**
 * Union type of all possible job status responses
 */
export type AudioVideoJobStatusResponse =
  | StatusAPIResponse
  | JobResultV2200
  | FireflyJobApiResponse;

export interface PollAudioVideoJobOptions {
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
  onProgress?: (status: AudioVideoJobStatusResponse) => void;
  /**
   * Custom timeout in milliseconds (overrides maxAttempts)
   */
  timeoutMs?: number;
  /**
   * Override the status URL path (if not using the standard endpoints)
   */
  statusUrlOverride?: string;
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
 * Determines the appropriate status endpoint to poll based on the job response
 */
function getStatusEndpoint(jobResult: AudioVideoJobResponse, statusUrlOverride?: string): string {
  if (statusUrlOverride) {
    return statusUrlOverride;
  }

  // If statusUrl is provided, extract the path from it
  if ('statusUrl' in jobResult && jobResult.statusUrl) {
    try {
      const url = new URL(jobResult.statusUrl);
      return url.pathname;
    } catch {
      // If URL parsing fails, try to extract the path directly
      const match = jobResult.statusUrl.match(/\/(v[0-9]+\/status\/.+)$/);
      if (match) {
        return `/${match[1]}`;
      }
    }
  }

  // Determine endpoint based on which properties exist
  const jobId = 'jobId' in jobResult ? jobResult.jobId : undefined;

  if (!jobId) {
    throw new PollingError('No job ID or status URL found in job result');
  }

  // Check if this is a v2 reframe job (has specific v2 properties)
  if ('outputs' in jobResult && Array.isArray(jobResult.outputs)) {
    return `/v2/status/${jobId}`;
  }

  // Default to v1 status endpoint for most jobs
  return `/v1/status/${jobId}`;
}

/**
 * Checks if a job status indicates completion (success or failure)
 */
function isJobComplete(status: AudioVideoJobStatusResponse): boolean {
  if ('status' in status) {
    const statusValue = status.status;
    return (
      statusValue === 'succeeded' ||
      statusValue === 'partially_succeeded' ||
      statusValue === 'failed'
    );
  }
  return false;
}

/**
 * Checks if a job status indicates success
 */
function isJobSuccessful(status: AudioVideoJobStatusResponse): boolean {
  if ('status' in status) {
    const statusValue = status.status;
    return statusValue === 'succeeded' || statusValue === 'partially_succeeded';
  }
  return false;
}

/**
 * Checks if a job status indicates failure
 */
function isJobFailed(status: AudioVideoJobStatusResponse): boolean {
  if ('status' in status) {
    return status.status === 'failed';
  }
  // Check if it's an error response with error_code
  if ('error_code' in status) {
    return true;
  }
  return false;
}

/**
 * Extracts error message from a failed job status
 */
function getErrorMessage(status: AudioVideoJobStatusResponse): string {
  if ('message' in status && status.message) {
    return status.message;
  }
  if ('error_code' in status && status.error_code) {
    return `Error code: ${status.error_code}`;
  }
  return 'Unknown error';
}

/**
 * Polls an Audio and Video API async job until completion
 *
 * This function works with all job types in the Audio and Video API:
 * - Template jobs (describe, render)
 * - Speech generation jobs
 * - Transcription jobs
 * - Dubbing jobs
 * - Avatar generation jobs
 * - Video reframing jobs (v1 and v2)
 *
 * @param jobResult - The job result containing jobId and/or statusUrl from the initial async response
 * @param options - Polling configuration options
 * @returns The final job status when succeeded
 * @throws {PollingTimeoutError} If max attempts or timeout is reached
 * @throws {PollingError} If the job fails
 *
 * @example
 * ```typescript
 * // Template rendering
 * const renderJob = await AudioVideoClient.templateRender({ source, variations });
 * const result = await pollAudioVideoJob(renderJob, {
 *   axiosRequestConfig: { headers },
 *   onProgress: (status) => console.log(`Status: ${status.status}`)
 * });
 *
 * // Speech generation
 * const speechJob = await AudioVideoClient.generateSpeech({ text: 'Hello world' });
 * const speechResult = await pollAudioVideoJob(speechJob, { axiosRequestConfig: { headers } });
 *
 * // Video reframing
 * const reframeJob = await AudioVideoClient.generateReframedVideoV2({ input, outputs });
 * const reframeResult = await pollAudioVideoJob(reframeJob, { axiosRequestConfig: { headers } });
 * ```
 */
export async function pollAudioVideoJob(
  jobResult: AudioVideoJobResponse,
  options: PollAudioVideoJobOptions = {}
): Promise<AudioVideoJobStatusResponse> {
  const {
    axiosRequestConfig = {},
    intervalMs = 2000,
    maxAttempts = 60,
    onProgress,
    timeoutMs,
    statusUrlOverride,
  } = options;

  const statusEndpoint = getStatusEndpoint(jobResult, statusUrlOverride);
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
      const response = await AUDIO_VIDEO_AXIOS_INSTANCE.get<AudioVideoJobStatusResponse>(
        statusEndpoint,
        axiosRequestConfig
      );
      const status = response.data;

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check if job is complete
      if (isJobComplete(status)) {
        if (isJobSuccessful(status)) {
          return status;
        }

        if (isJobFailed(status)) {
          const errorMessage = getErrorMessage(status);
          throw new PollingError(`Job failed: ${errorMessage}`, JSON.stringify(status));
        }
      }

      // Job still running (not_started, running, pending), wait before next poll
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
