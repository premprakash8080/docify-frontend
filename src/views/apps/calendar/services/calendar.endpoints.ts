/**
 * Calendar API Endpoints - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const CALENDAR_ENDPOINTS = {
  getCalendarEventsByDate: '/calendar/getCalendarEventsByDate',
  getExternalEvents: '/calendar/getExternalEvents',
  createExternalEvent: '/calendar/createExternalEvents',
  getTaskById: '/tasks/getTaskById',
  getNoteById: '/notes/getNoteById',
} as const;

