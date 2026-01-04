import { httpClient } from '@/core/http';
import { NOTES_ENDPOINTS } from './note.endpoints';

export interface Image {
  id: string | number;
  secure_url: string;
  url?: string; // For backward compatibility
}

export interface ImageResponse {
  success: boolean;
  msg?: string;
  data: Image;
}

export interface ImagesResponse {
  success: boolean;
  msg?: string;
  data: Image[];
}

class ImageService {
  /**
   * Upload an image to a note
   * @param file - Image file to upload
   * @param noteId - Optional note ID to associate the image with
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Image response with uploaded image data
   */
  async uploadImage(file: File, noteId?: string, showLoader = true): Promise<ImageResponse> {
    const formData = new FormData();
    formData.append('image', file); // API expects 'image' field, not 'file'
    if (noteId) {
      formData.append('note_id', noteId);
    }

    const response = await httpClient.post<{ success: boolean; msg?: string; data: Image }>(
      NOTES_ENDPOINTS.uploadNoteImage,
      formData,
      {
        showLoader,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Handle response format - API returns { success: true, msg: "...", data: { id, secure_url } }
    if (response.data && typeof response.data === 'object') {
      if ('data' in response.data && response.data.data) {
        return {
          success: response.data.success ?? true,
          msg: response.data.msg,
          data: response.data.data,
        };
      }
      // If data is nested differently
      if ('success' in response.data) {
        return response.data as ImageResponse;
      }
    }
    
    // Fallback
    return {
      success: true,
      msg: 'Image uploaded successfully',
      data: response.data as Image,
    };
  }

  /**
   * Get all note images
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Images response
   */
  async getImages(showLoader = true): Promise<ImagesResponse> {
    const response = await httpClient.get<Image[]>(
      NOTES_ENDPOINTS.getNoteImages,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as ImagesResponse;
    }
    return {
      success: true,
      msg: 'Images fetched successfully',
      data: Array.isArray(response.data) ? response.data : [],
    };
  }

  /**
   * Delete a note image
   * @param id - Image ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Success response
   */
  async deleteImage(id: string | number, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    await httpClient.delete(
      NOTES_ENDPOINTS.deleteNoteImage(String(id)),
      { showLoader }
    );

    return {
      success: true,
      msg: 'Image deleted successfully',
    };
  }
}

export default new ImageService();

