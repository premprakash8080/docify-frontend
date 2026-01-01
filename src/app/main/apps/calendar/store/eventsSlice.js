import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import formatISO from 'date-fns/formatISO';
import { format } from 'date-fns';
import calendarService from '../services/calendar.service';
import { selectSelectedLabels } from './labelsSlice';

export const dateFormat = 'YYYY-MM-DDTHH:mm:ss.sssZ';

/**
 * Transform API calendar item to FullCalendar event format
 */
const transformCalendarItem = (item) => {
  return {
    id: item.id,
    title: item.title,
    start: item.start,
    end: item.end || null,
    allDay: item.allDay || false,
    extendedProps: {
      type: item.type, // 'task' or 'note'
      completed: item.completed || false,
      color: item.color || '#1976d2',
      sourceId: item.sourceId,
      label: item.type === 'task' ? 'task' : 'note', // For label filtering
    },
  };
};

export const getEvents = createAsyncThunk(
  'calendarApp/events/getEvents',
  async ({ date, view = 'month' } = {}, { rejectWithValue }) => {
    try {
      // Format date to YYYY-MM-DD if it's a Date object
      const dateString = date instanceof Date ? format(date, 'yyyy-MM-dd') : date || format(new Date(), 'yyyy-MM-dd');
      
      const response = await calendarService.getCalendarEventsByDate(dateString, view);
      const responseData = response.data;

      // Handle API response format: { success: true, data: { items: [...] } }
      if (responseData.success && responseData.data?.items) {
        // Transform API items to FullCalendar format
        const transformedEvents = responseData.data.items.map(transformCalendarItem);
        return transformedEvents;
      } else if (Array.isArray(responseData)) {
        // If API returns array directly
        return responseData.map(transformCalendarItem);
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // If API returns { data: [...] }
        return responseData.data.map(transformCalendarItem);
      }
      
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch calendar events');
    }
  }
);

export const addEvent = createAsyncThunk(
  'calendarApp/events/addEvent',
  async (newEvent, { rejectWithValue }) => {
    try {
      // Note: Calendar events are typically created as tasks or notes
      // This would need to be implemented based on your API
      // For now, we'll just add it to local state
      const transformedEvent = transformCalendarItem(newEvent);
      return transformedEvent;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to add event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'calendarApp/events/updateEvent',
  async (event, { rejectWithValue }) => {
    try {
      // Note: Calendar events are typically updated via tasks or notes API
      // This would need to be implemented based on your API
      // For now, we'll just update local state
      return event;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to update event');
    }
  }
);

export const removeEvent = createAsyncThunk(
  'calendarApp/events/removeEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      // Note: Calendar events are typically deleted via tasks or notes API
      // This would need to be implemented based on your API
      // For now, we'll just remove from local state
      return eventId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to remove event');
    }
  }
);

const eventsAdapter = createEntityAdapter({});

export const {
  selectAll: selectEvents,
  selectIds: selectEventIds,
  selectById: selectEventById,
} = eventsAdapter.getSelectors((state) => state.calendarApp.events);

const eventsSlice = createSlice({
  name: 'calendarApp/events',
  initialState: eventsAdapter.getInitialState({
    eventDialog: {
      type: 'new',
      props: {
        open: false,
        anchorPosition: { top: 200, left: 400 },
      },
      data: null,
    },
  }),
  reducers: {
    openNewEventDialog: {
      prepare: (selectInfo) => {
        const { start, end, jsEvent } = selectInfo;
        const payload = {
          type: 'new',
          props: {
            open: true,
            anchorPosition: { top: jsEvent.pageY, left: jsEvent.pageX },
          },
          data: {
            start: formatISO(new Date(start)),
            end: formatISO(new Date(end)),
          },
        };
        return { payload };
      },
      reducer: (state, action) => {
        state.eventDialog = action.payload;
      },
    },
    openEditEventDialog: {
      prepare: (clickInfo) => {
        const { jsEvent, event } = clickInfo;
        const { id, title, allDay, start, end, extendedProps } = event;

        const payload = {
          type: 'edit',
          props: {
            open: true,
            anchorPosition: { top: jsEvent.pageY, left: jsEvent.pageX },
          },
          data: {
            id,
            title,
            allDay,
            extendedProps,
            start: formatISO(new Date(start)),
            end: formatISO(new Date(end)),
          },
        };
        return { payload };
      },
      reducer: (state, action) => {
        state.eventDialog = action.payload;
      },
    },
    closeNewEventDialog: (state, action) => {
      state.eventDialog = {
        type: 'new',
        props: {
          open: false,
          anchorPosition: { top: 200, left: 400 },
        },
        data: null,
      };
    },
    closeEditEventDialog: (state, action) => {
      state.eventDialog = {
        type: 'edit',
        props: {
          open: false,
          anchorPosition: { top: 200, left: 400 },
        },
        data: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        eventsAdapter.setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        eventsAdapter.addOne(state, action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        eventsAdapter.upsertOne(state, action.payload);
      })
      .addCase(removeEvent.fulfilled, (state, action) => {
        eventsAdapter.removeOne(state, action.payload);
      });
  },
});

export const {
  openNewEventDialog,
  closeNewEventDialog,
  openEditEventDialog,
  closeEditEventDialog,
} = eventsSlice.actions;

export const selectFilteredEvents = createSelector(
  [selectSelectedLabels, selectEvents],
  (selectedLabels, events) => {
    return events.filter((item) => selectedLabels.includes(item.extendedProps.label));
  }
);

export const selectEventDialog = ({ calendarApp }) => calendarApp.events.eventDialog;

export default eventsSlice.reducer;
