/**
 * File API Endpoints - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const FILE_ENDPOINTS = {
  getAllFiles: '/files',
  getFileById: (fileId: number | string) => `/files/${fileId}`,
  uploadFile: '/files',
  updateFileMetadata: (fileId: number | string) => `/files/${fileId}`,
  deleteFile: (fileId: number | string) => `/files/${fileId}`,
  attachFileToNote: (fileId: number | string, noteId: string) => `/files/${fileId}/note/${noteId}`,
  detachFileFromNote: (fileId: number | string) => `/files/${fileId}/note`,
  downloadFile: (fileId: number | string) => `/files/${fileId}/download`,
} as const;

