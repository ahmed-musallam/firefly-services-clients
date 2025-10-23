export const JobStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
