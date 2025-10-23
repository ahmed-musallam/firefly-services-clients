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

  /**
   * Get a valid access token from the data provided in the constructor.
   * No caching or token refresh is performed, as this client is a lightweight
   * holder for an already-issued token.
   */
  async getAccessToken(): Promise<string> {
    return this.accessToken;
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
