import httpService, { httpClient } from '@/core/http';
import { FILE_ENDPOINTS } from './file.endpoints';
import type { File, FilesResponse, FileResponse, UpdateFileMetadataPayload } from '../types';

/**
 * File Service - Using centralized HttpService
 * 
 * Handles all file-related API calls:
 * - CRUD operations
 * - File upload
 * - File attachment to notes
 */
class FileService {
  /**
   * Get all files
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Files response
   */
  async getAllFiles(showLoader = true): Promise<FilesResponse> {
    const response = await httpService.get<File[]>(FILE_ENDPOINTS.getAllFiles, { showLoader });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as FilesResponse;
    }
    return {
      success: true,
      msg: 'Files fetched successfully',
      data: Array.isArray(response.data) ? response.data : [],
    };
  }

  /**
   * Get file by ID
   * @param fileId - File ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns File response
   */
  async getFileById(fileId: number | string, showLoader = true): Promise<FileResponse> {
    const response = await httpService.get<File>(FILE_ENDPOINTS.getFileById(fileId), { showLoader });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as FileResponse;
    }
    return {
      success: true,
      msg: 'File fetched successfully',
      data: response.data as File,
    };
  }

  /**
   * Upload a file
   * @param formData - FormData containing the file
   * @param showLoader - Whether to show global loader (default: true)
   * @returns File response
   */
  async uploadFile(formData: FormData, showLoader = true): Promise<FileResponse> {
    // Use httpClient directly for FormData to handle multipart/form-data correctly
    const response = await httpClient.post<File>(
      FILE_ENDPOINTS.uploadFile,
      formData,
      {
        showLoader,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as FileResponse;
    }
    return {
      success: true,
      msg: 'File uploaded successfully',
      data: response.data as File,
    };
  }

  /**
   * Update file metadata
   * @param fileId - File ID
   * @param data - Update data
   * @param showLoader - Whether to show global loader (default: true)
   * @returns File response
   */
  async updateFileMetadata(
    fileId: number | string,
    data: UpdateFileMetadataPayload,
    showLoader = true
  ): Promise<FileResponse> {
    const response = await httpService.put<File>(
      FILE_ENDPOINTS.updateFileMetadata(fileId),
      {
        id: fileId,
        filename: data.filename,
        description: data.description,
      },
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as FileResponse;
    }
    return {
      success: true,
      msg: 'File updated successfully',
      data: response.data as File,
    };
  }

  /**
   * Delete a file
   * @param fileId - File ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Success response
   */
  async deleteFile(fileId: number | string, showLoader = true): Promise<{ success: boolean; msg: string }> {
    const response = await httpClient.delete<unknown>(FILE_ENDPOINTS.deleteFile(fileId), { showLoader });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as { success: boolean; msg: string };
    }
    return {
      success: true,
      msg: 'File deleted successfully',
    };
  }

  /**
   * Attach file to note
   * @param fileId - File ID
   * @param noteId - Note ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Success response
   */
  async attachFileToNote(
    fileId: number | string,
    noteId: string,
    showLoader = true
  ): Promise<{ success: boolean; msg: string }> {
    const response = await httpService.put<unknown>(
      FILE_ENDPOINTS.attachFileToNote(fileId, noteId),
      {},
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as { success: boolean; msg: string };
    }
    return {
      success: true,
      msg: 'File attached to note successfully',
    };
  }

  /**
   * Detach file from note
   * @param fileId - File ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Success response
   */
  async detachFileFromNote(
    fileId: number | string,
    showLoader = true
  ): Promise<{ success: boolean; msg: string }> {
    const response = await httpClient.delete<unknown>(FILE_ENDPOINTS.detachFileFromNote(fileId), { showLoader });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as { success: boolean; msg: string };
    }
    return {
      success: true,
      msg: 'File detached from note successfully',
    };
  }
}

export default new FileService();

