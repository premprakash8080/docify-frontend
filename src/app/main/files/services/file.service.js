import axios from 'axios';
import apiConfig from '../../../configs/apiConfig';
import { ENDPOINTS } from './file.endpoints';

// Create a separate axios instance to bypass mock adapter
const axiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout || 30000,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class FileService {
  constructor() {
    this.httpService = axiosInstance;
  }

  getAllFiles() {
    return this.httpService.get(ENDPOINTS.getAllFiles);
  }

  getFileById(fileId) {
    return this.httpService.get(ENDPOINTS.getFileById(fileId));
  }

  uploadFile(formData) {
    return this.httpService.post(ENDPOINTS.uploadFile, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  updateFileMetadata(fileId, data) {
    return this.httpService.put(ENDPOINTS.updateFileMetadata(fileId), {
      id: fileId,
      filename: data.filename,
      description: data.description,
    });
  }

  deleteFile(fileId) {
    return this.httpService.delete(ENDPOINTS.deleteFile(fileId));
  }

  attachFileToNote(fileId, noteId) {
    return this.httpService.put(ENDPOINTS.attachFileToNote(fileId, noteId), {});
  }

  detachFileFromNote(fileId) {
    return this.httpService.delete(ENDPOINTS.detachFileFromNote(fileId));
  }
}

export default new FileService();

