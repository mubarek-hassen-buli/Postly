import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { apiClient } from '../api/client';

export interface LinkedInAccount {
  id: string;
  linkedin_member_id: string;
  person_urn: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string | null;
  picture_url: string | null;
  scopes: string;
  token_expires_at: string;
  is_expired: boolean;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
}

export interface LinkedInStatusResponse {
  is_connected: boolean;
  account: LinkedInAccount | null;
}

export interface LinkedInPublishResponse {
  status: string;
  platform: string;
  post_urn: string;
  published_at: string;
  message: string;
}

export const linkedinService = {
  /**
   * Retrieves the OAuth 2.0 authorization URL from the backend.
   */
  async getAuthUrl(): Promise<{ authorization_url: string; state: string }> {
    const response = await apiClient.get<{ authorization_url: string; state: string }>(
      '/integrations/linkedin/authorize/'
    );
    return response.data;
  },

  /**
   * Fetches current connection and profile status for LinkedIn.
   */
  async getStatus(): Promise<LinkedInStatusResponse> {
    const response = await apiClient.get<LinkedInStatusResponse>(
      '/integrations/linkedin/status/'
    );
    return response.data;
  },

  /**
   * Initiates the in-app browser session to authenticate with LinkedIn.
   */
  async connectLinkedIn(): Promise<{ success: boolean; message?: string }> {
    try {
      const { authorization_url } = await this.getAuthUrl();

      // In Expo Go, Linking.createURL generates the correct development URL (exp://...),
      // and in standalone builds it creates (postly://...)
      const redirectUrl = Linking.createURL('oauth/linkedin');

      await WebBrowser.openAuthSessionAsync(
        authorization_url,
        redirectUrl
      );

      // Verify connection status immediately after browser window closes
      const statusCheck = await this.getStatus();
      if (statusCheck.is_connected) {
        return {
          success: true,
          message: `Connected as ${statusCheck.account?.name || 'LinkedIn User'}`,
        };
      }

      return { success: false, message: 'LinkedIn login was closed without completing.' };
    } catch (error: any) {
      // Check if the backend connection actually succeeded before surfacing an error
      try {
        const fallbackCheck = await this.getStatus();
        if (fallbackCheck.is_connected) {
          return {
            success: true,
            message: `Connected as ${fallbackCheck.account?.name || 'LinkedIn User'}`,
          };
        }
      } catch {
        // Ignore fallback check failure
      }

      return {
        success: false,
        message: error.message || 'Failed to complete LinkedIn authentication.',
      };
    }
  },

  /**
   * Disconnects the user's LinkedIn account and revokes stored credentials.
   */
  async disconnect(): Promise<void> {
    await apiClient.post('/integrations/linkedin/disconnect/');
  },

  /**
   * Directly publishes a plain text post to the user's personal LinkedIn feed.
   */
  async publishPost(text: string): Promise<LinkedInPublishResponse> {
    const response = await apiClient.post<LinkedInPublishResponse>(
      '/integrations/linkedin/publish/',
      { text }
    );
    return response.data;
  },
};
