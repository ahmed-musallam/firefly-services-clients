/**
 * IMS (Adobe Identity Management System) Client for OAuth 2.0 Client Credentials Flow
 * See: https://developer.adobe.com/developer-console/docs/guides/authentication/ServerToServerAuthentication/ims#fetching-access-tokens
 */

import type { IIMSClient } from './ims-client.interface';

export class TokenIMSClient implements IIMSClient {
  private accessToken: string;
  private clientId: string;

  constructor({ accessToken, clientId }: { accessToken: string; clientId: string }) {
    this.accessToken = accessToken;
    this.clientId = clientId;
  }
  getAccessToken(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  /**
   * Get headers for authenticated Firefly API requests.
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'x-api-key': this.clientId,
    };
  }
}
