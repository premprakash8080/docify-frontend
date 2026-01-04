import httpService from '@/core/http';
import { CALENDAR_ENDPOINTS } from './calendar.endpoints';
import type { Task } from '@/views/tasks/types';
import type { Note } from '@/views/notes/types';

export interface CalendarEvent {
  id: string | number;
  type: 'task' | 'note';
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  completed: boolean;
  color: string;
  sourceId: string | number;
  start_date?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | null;
  flagged?: boolean;
  reminder?: string | null;
  assigned_to?: string | null;
  sort_order?: number | null;
  note_id?: string | null;
}

export interface CalendarEventsResponse {
  success: boolean;
  data: {
    tasks: CalendarEvent[];
    notes: CalendarEvent[];
  };
}

export interface GetCalendarEventsParams {
  date: string; // YYYY-MM-DD format
  view: 'day' | 'week' | 'month';
}

export interface ExternalEvent {
  id: string | number;
  title: string;
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'info' | 'warning' | 'dark';
  description?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  start_time?: string | null; // HH:mm format
  end_time?: string | null; // HH:mm format
  reminder?: string | null; // HH:mm format
  assigned_to?: string | null;
  flagged?: boolean;
}

export interface ExternalEventsResponse {
  success: boolean;
  msg?: string;
  data: {
    externalEvents: ExternalEvent[];
  };
}

export interface CreateExternalEventPayload {
  title: string; // required
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'info' | 'warning' | 'dark'; // optional, default: "primary"
  description?: string | null; // optional
  priority?: 'low' | 'medium' | 'high' | null; // optional
  start_time?: string | null; // optional, HH:MM format
  end_time?: string | null; // optional, HH:MM format
  reminder?: string | null; // optional, HH:MM format
  assigned_to?: string | null; // optional
  flagged?: boolean; // optional, default: false
}

export interface CreateExternalEventResponse {
  success: boolean;
  msg?: string;
  data: {
    externalEvent: ExternalEvent;
  };
}

export interface TaskResponse {
  success: boolean;
  msg?: string;
  data: {
    task: Task;
  };
}

export interface NoteResponse {
  success: boolean;
  msg?: string;
  data: {
    note: Note;
  };
}

class CalendarService {
  /**
   * Get calendar events by date and view
   * @param params - Date and view parameters
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Calendar events response
   */
  async getCalendarEventsByDate(
    params: GetCalendarEventsParams,
    showLoader = true
  ): Promise<CalendarEventsResponse> {
    const response = await httpService.get<CalendarEventsResponse>(
      `${CALENDAR_ENDPOINTS.getCalendarEventsByDate}?date=${params.date}&view=${params.view}`,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as CalendarEventsResponse;
    }
    return {
      success: true,
      data: {
        tasks: [],
        notes: [],
      },
    };
  }

  /**
   * Get external events (task templates for drag and drop)
   * @param showLoader - Whether to show global loader (default: true)
   * @returns External events response
   */
  async getExternalEvents(showLoader = true): Promise<ExternalEventsResponse> {
    const response = await httpService.get<{ externalEvents: ExternalEvent[] }>(
      CALENDAR_ENDPOINTS.getExternalEvents,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as ExternalEventsResponse;
    }
    return {
      success: true,
      msg: 'External events fetched successfully',
      data: {
        externalEvents: Array.isArray(response.data?.externalEvents) ? response.data.externalEvents : [],
      },
    };
  }

  /**
   * Create a new external event (task template)
   * @param payload - External event data
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Created external event response
   */
  async createExternalEvent(
    payload: CreateExternalEventPayload,
    showLoader = true
  ): Promise<CreateExternalEventResponse> {
    const response = await httpService.post<{ externalEvent: ExternalEvent }>(
      CALENDAR_ENDPOINTS.createExternalEvent,
      payload,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const responseData = response.data as { data: { externalEvent: ExternalEvent } };
      return {
        success: true,
        msg: 'External event created successfully',
        data: {
          externalEvent: responseData.data.externalEvent,
        },
      };
    }
    
    // If response.data is the externalEvent directly
    if (response.data && typeof response.data === 'object' && 'externalEvent' in response.data) {
      const responseData = response.data as { externalEvent: ExternalEvent };
      return {
        success: true,
        msg: 'External event created successfully',
        data: {
          externalEvent: responseData.externalEvent,
        },
      };
    }
    
    // Fallback
    return {
      success: true,
      msg: 'External event created successfully',
      data: {
        externalEvent: response.data as unknown as ExternalEvent,
      },
    };
  }

  /**
   * Get task by ID
   * @param taskId - Task ID (number or string, passed exactly as received)
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Task response
   */
  async getTaskById(taskId: string | number, showLoader = true): Promise<TaskResponse> {
    // Pass ID exactly as received - no parsing or casting
    const response = await httpService.get<{ task: Task }>(
      `${CALENDAR_ENDPOINTS.getTaskById}?id=${taskId}`,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TaskResponse;
    }
    return {
      success: true,
      msg: 'Task fetched successfully',
      data: response.data as { task: Task },
    };
  }

  /**
   * Get note by ID
   * @param noteId - Note ID (UUID string, passed exactly as received)
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Note response
   */
  async getNoteById(noteId: string, showLoader = true): Promise<NoteResponse> {
    // Pass ID exactly as received - no parsing or casting
      const response = await httpService.get<{ success: boolean; data: { note: Note } }>(
      `${CALENDAR_ENDPOINTS.getNoteById}?id=${noteId}`,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const data = (response.data as { data: { note: Note } }).data;
      if (data && typeof data === 'object' && 'note' in data) {
        return {
          success: true,
          msg: 'Note fetched successfully',
          data: { note: data.note },
        };
      }
    }
    return {
      success: true,
      msg: 'Note fetched successfully',
      data: { note: response.data as unknown as Note },
    };
  }
}

export default new CalendarService();

