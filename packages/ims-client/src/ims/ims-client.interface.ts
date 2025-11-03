/**
 * Shared interface for IMS clients
 */
export interface IIMSClient {
  getAccessToken(): Promise<string>;
  getClientId(): string;
  getAuthHeaders(): Promise<Record<string, string>>;
}

export interface IMSClientOptions {
  clientId: string;
  clientSecret: string;
  technicalAccountEmail?: string;
  technicalAccountId?: string;
  scopes: string[];
  imsOrgId?: string;
}
