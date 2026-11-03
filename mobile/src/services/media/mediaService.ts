import { apiClient } from '../api/client';
import axios from 'axios';

export interface UploadedMediaItem {
  id: string;
  media_url: string;
  public_id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  file_name: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  format?: string;
  created_at: string;
}

export interface UploadSignatureResponse {
  timestamp: number;
  signature: string;
  api_key: string;
  cloud_name: string;
  folder: string;
  upload_url: string;
}

export const mediaService = {
  async getUploadSignature(resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'): Promise<UploadSignatureResponse> {
    const response = await apiClient.get<UploadSignatureResponse>('/media/upload-signature/', {
      params: { resource_type: resourceType },
    });
    return response.data;
  },

  async uploadMediaDirect(
    fileUri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadedMediaItem> {
    // Construct multipart form data
    const formData = new FormData();
    const file = {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any;

    formData.append('file', file);

    const response = await apiClient.post<UploadedMediaItem>('/media/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data;
  },

  async deleteMedia(id: string): Promise<void> {
    await apiClient.delete(`/media/${id}/`);
  },
};
