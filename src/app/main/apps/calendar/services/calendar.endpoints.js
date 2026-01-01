import apiConfig from '../../../../configs/apiConfig';

const API_BASE = apiConfig.baseURL;

export const ENDPOINTS = {
  getCalendarEventsByDate: `${API_BASE}/calendar/getCalendarEventsByDate`,
  getCalendarEventsByRange: `${API_BASE}/calendar/getCalendarEventsByRange`,
  getCalendarItems: `${API_BASE}/calendar/getCalendarItems`,
};

