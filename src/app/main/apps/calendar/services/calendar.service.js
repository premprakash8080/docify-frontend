import axios from 'axios';
import apiConfig from '../../../../configs/apiConfig';
import { ENDPOINTS } from './calendar.endpoints';

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

class CalendarService {
  constructor() {
    this.httpService = axiosInstance;
  }

  getCalendarEventsByDate(date, view) {
    const params = { date, view };
    const queryString = new URLSearchParams(params).toString();
    return this.httpService.get(`${ENDPOINTS.getCalendarEventsByDate}?${queryString}`);
  }

  getCalendarEventsByRange(start, end) {
    const params = { start, end };
    const queryString = new URLSearchParams(params).toString();
    return this.httpService.get(`${ENDPOINTS.getCalendarEventsByRange}?${queryString}`);
  }

  getCalendarItems() {
    return this.httpService.get(ENDPOINTS.getCalendarItems);
  }
}

export default new CalendarService();

