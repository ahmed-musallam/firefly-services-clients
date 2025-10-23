/**
 * Common types shared across Firefly API operations
 */

import type { IIMSClient } from '../../ims/ims-client.interface';
import type { ModelVersionType, VideoModelVersionType } from '../constants';

export interface FireflyClientOptions {
  imsClient: IIMSClient;
  baseUrl?: string; // override for testing
}

export type ModelVersion = ModelVersionType;

export type VideoModelVersion = VideoModelVersionType;
