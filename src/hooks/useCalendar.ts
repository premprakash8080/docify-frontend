
import type { DateInput, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core'
import {type  DateClickArg, type DropArg, type EventResizeDoneArg } from '@fullcalendar/interaction'
import { useState, useEffect, useCallback, useRef } from 'react'
import calendarService from '@/views/apps/calendar/services/calendar.service'
import type { CalendarEvent } from '@/views/apps/calendar/services/calendar.service'
import { useDispatch } from 'react-redux'
import { createTask, fetchTasks, updateTask } from '@/views/tasks/store/tasksSlice'
import type { CreateTaskPayload, UpdateTaskPayload } from '@/views/tasks/types'
import type { AppDispatch } from '@/store/types'
import { useNotificationContext } from '@/context/useNotificationContext'

/**
 * Transform API calendar event to FullCalendar EventInput format
 */
const transformCalendarEventToEventInput = (event: CalendarEvent): EventInput => {
  const eventId = `${event.type}_${event.sourceId}`
  
  // Determine background color class based on color hex
  let className = 'bg-primary-subtle text-primary'
  if (event.color) {
    // Map common colors to Bootstrap classes
    const colorMap: Record<string, string> = {
      '#ffc107': 'bg-warning-subtle text-warning',
      '#00ff00': 'bg-success-subtle text-success',
      '#f44336': 'bg-danger-subtle text-danger',
      '#2196f3': 'bg-info-subtle text-info',
      '#9c27b0': 'bg-primary-subtle text-primary',
      '#ff9800': 'bg-warning-subtle text-warning',
      '#4caf50': 'bg-success-subtle text-success',
    }
    className = colorMap[event.color.toLowerCase()] || className
  }

  return {
    id: eventId,
    title: event.title,
    start: event.start,
    end: event.end || undefined,
    allDay: event.allDay,
    className: className,
    extendedProps: {
      type: event.type,
      sourceId: event.sourceId,
      completed: event.completed,
      color: event.color,
      description: event.description,
      priority: event.priority,
      flagged: event.flagged,
      reminder: event.reminder,
      assigned_to: event.assigned_to,
      note_id: event.note_id,
    },
  }
}

interface UseCalendarParams {
  currentDate?: Date
  currentView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth'
}

const useCalendar = (params?: UseCalendarParams) => {
  const dispatch: AppDispatch = useDispatch()
  const { showNotification } = useNotificationContext()
  const [show, setShow] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const onOpenModal = () => setShow(true)
  const [isEditable, setIsEditable] = useState<boolean>(false)
  const [events, setEvents] = useState<EventInput[]>([])
  const [eventData, setEventData] = useState<EventInput>()
  const [dateInfo, setDateInfo] = useState<DateClickArg>()

  /**
   * Fetch calendar events from API
   */
  const fetchEvents = useCallback(async (date: Date, view: string) => {
    setLoading(true)
    setError(null)

    try {
      // Map FullCalendar view names to API view names
      const viewMap: Record<string, 'day' | 'week' | 'month'> = {
        dayGridMonth: 'month',
        timeGridWeek: 'week',
        timeGridDay: 'day',
        listMonth: 'month',
      }
      
      const apiView = viewMap[view] || 'month'
      // Format date as YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      console.log('Fetching calendar events:', { date: dateStr, view: apiView, calendarView: view })

      const response = await calendarService.getCalendarEventsByDate(
        { date: dateStr, view: apiView },
        false // Don't show global loader
      )

      if (response.success && response.data) {
        // Transform tasks and notes to EventInput format
        const transformedEvents: EventInput[] = [
          ...response.data.tasks.map(transformCalendarEventToEventInput),
          ...response.data.notes.map(transformCalendarEventToEventInput),
        ]
        setEvents(transformedEvents)
      } else {
        setEvents([])
      }
    } catch (err: any) {
      console.error('Failed to fetch calendar events:', err)
      setError(err.message || 'Failed to load calendar events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Track last fetched date/view to prevent duplicate fetches
  const lastFetchedRef = useRef<{ dateStr: string; view: string } | null>(null)
  const isFetchingRef = useRef(false)

  // Fetch events when date or view changes from URL
  // Only fetch when URL params actually change, not on every render
  useEffect(() => {
    if (params?.currentDate && params?.currentView) {
      // Ensure we have a valid date object
      const date = params.currentDate instanceof Date ? params.currentDate : new Date(params.currentDate)
      
      // Only fetch if date is valid
      if (!isNaN(date.getTime())) {
        // Format date as string for stable comparison
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        // Get current view key
        const viewKey = params.currentView
        
        // Check if we've already fetched for this exact date/view combination
        const lastFetched = lastFetchedRef.current
        if (lastFetched && lastFetched.dateStr === dateStr && lastFetched.view === viewKey) {
          return // Already fetched, skip
        }
        
        // Prevent concurrent fetches
        if (isFetchingRef.current) {
          return
        }
        
        // Update refs and fetch
        lastFetchedRef.current = { dateStr, view: viewKey }
        isFetchingRef.current = true
        
        fetchEvents(date, viewKey).finally(() => {
          isFetchingRef.current = false
        })
      }
    }
  }, [
    params?.currentDate ? `${params.currentDate.getFullYear()}-${String(params.currentDate.getMonth() + 1).padStart(2, '0')}-${String(params.currentDate.getDate()).padStart(2, '0')}` : null,
    params?.currentView,
    fetchEvents
  ])

  const onCloseModal = () => {
    setEventData(undefined)
    setDateInfo(undefined)
    setShow(false)
  }

  const onDateClick = (arg: DateClickArg) => {
    setDateInfo(arg)
    onOpenModal()
    setIsEditable(false)
  }

  const onEventClick = (arg: EventClickArg) => {
    const classNames = arg.event.classNames
    const extendedProps = arg.event.extendedProps || {}
    const event: EventInput = {
      id: arg.event.id,
      title: arg.event.title || '',
      className: Array.isArray(classNames) ? classNames.join(' ') : classNames || '',
      start: arg.event.start || undefined,
      end: arg.event.end || undefined,
      allDay: arg.event.allDay || false,
      extendedProps: extendedProps,
    }
    setEventData(event)
    setIsEditable(true)
    onOpenModal()
  }

  const onDrop = async (arg: DropArg) => {
    const dropEventData = arg
    const title = dropEventData.draggedEl.title
    
    // Check if this is an external event (has external event data stored on the element)
    const externalEventData = (arg.draggedEl as any)?.__externalEventData
    
    if (externalEventData) {
      // This is an external event - directly create task based on view
      const currentView = params?.currentView || 'dayGridMonth'
      const isMonthView = currentView === 'dayGridMonth' || currentView === 'listMonth'
      
      // Get the date from where the event was dropped
      let dropDate: Date
      if (arg.date) {
        dropDate = arg.date instanceof Date ? arg.date : new Date(arg.date)
      } else if (arg.dateStr) {
        dropDate = new Date(arg.dateStr)
      } else {
        dropDate = new Date()
      }
      
      // Format date as YYYY-MM-DD (local date, not UTC)
      const year = dropDate.getFullYear()
      const month = String(dropDate.getMonth() + 1).padStart(2, '0')
      const day = String(dropDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const timeToMinutes = (time: string): number => {
        const [h, m] = time.split(':').map(Number)
        return h * 60 + m
      }
      const minutesToTime = (minutes: number): string => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
      
      let startTime: string | null = null
      let endTime: string | null = null
      
      if (isMonthView) {
        // Month view: Use external event's default start_time, calculate end_time from duration
        startTime = externalEventData.start_time || null
        if (startTime && externalEventData.end_time) {
          const startMinutes = timeToMinutes(startTime)
          const endMinutes = timeToMinutes(externalEventData.end_time)
          const duration = endMinutes - startMinutes
          endTime = minutesToTime(startMinutes + duration)
        } else {
          endTime = externalEventData.end_time || null
        }
      } else {
        // Week/Day view: Use dropped time slot
        if (arg.date) {
          const dropDateTime = arg.date instanceof Date ? arg.date : new Date(arg.date)
          const hours = dropDateTime.getHours()
          const minutes = dropDateTime.getMinutes()
          startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
          
          // Calculate end_time using external event's duration
          if (externalEventData.start_time && externalEventData.end_time) {
            const originalStartMinutes = timeToMinutes(externalEventData.start_time)
            const originalEndMinutes = timeToMinutes(externalEventData.end_time)
            const duration = originalEndMinutes - originalStartMinutes
            const droppedStartMinutes = timeToMinutes(startTime)
            endTime = minutesToTime(droppedStartMinutes + duration)
          } else {
            // Default 1 hour duration if no duration available
            const droppedStartMinutes = timeToMinutes(startTime)
            endTime = minutesToTime(droppedStartMinutes + 60)
          }
        } else {
          startTime = externalEventData.start_time || null
          endTime = externalEventData.end_time || null
        }
      }
      
      try {
        setLoading(true)
        
        const payload: CreateTaskPayload = {
          label: externalEventData.title || title,
          description: externalEventData.description || null,
          due_date: dateStr,
          start_time: startTime,
          end_time: endTime,
          reminder: externalEventData.reminder || null,
          assigned_to: externalEventData.assigned_to || null,
          priority: externalEventData.priority || null,
          flagged: externalEventData.flagged || false,
          completed: false,
        }

        const result = await dispatch(createTask(payload))
        
        if (result.type.endsWith('/fulfilled')) {
          dispatch(fetchTasks())
          
          if (params?.currentDate && params?.currentView) {
            await fetchEvents(params.currentDate, params.currentView)
          }
        } else {
          console.error('Failed to create task from external event:', result.payload)
          setError(result.payload as string || 'Failed to create task')
        }
      } catch (err: any) {
        console.error('Error creating task from external event:', err)
        setError(err.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    } else if (title) {
      // Legacy behavior for non-external events
      const newEvent = {
        id: dropEventData.draggedEl.id,
        title,
        start: dropEventData ? dropEventData.dateStr : new Date(),
        className: dropEventData.draggedEl.dataset.class,
      }
      const modifiedEvents = [...events]
      modifiedEvents.push(newEvent)

      setEvents(modifiedEvents)
    }
  }

  const onAddEvent = async () => {
    // Note: This will be handled by the modal component which will call the task/note API
    // After successful creation, we should refetch events
    // For now, we'll just close the modal and let the parent component handle the refresh
    onCloseModal()
    
    // If dateInfo is available, refetch events for that date
    if (dateInfo?.date && params?.currentView) {
      await fetchEvents(dateInfo.date, params.currentView)
    }
  }

  const onUpdateEvent = async () => {
    // Note: This will be handled by the modal component which will call the task/note API
    // After successful update, we should refetch events
    onCloseModal()
    setIsEditable(false)
    
    // Refetch events to get updated data
    if (params?.currentDate && params?.currentView) {
      await fetchEvents(params.currentDate, params.currentView)
    }
  }

  const onRemoveEvent = async () => {
    // Note: This will be handled by the modal component which will call the task/note API
    // After successful deletion, we should refetch events
    onCloseModal()
    
    // Refetch events to get updated data
    if (params?.currentDate && params?.currentView) {
      await fetchEvents(params.currentDate, params.currentView)
    }
  }

  // Helper function to extract date and time from FullCalendar event
  const extractDateTimeFromEvent = (event: any): { due_date: string | null; start_time: string | null; end_time: string | null } => {
    if (!event.start) {
      return { due_date: null, start_time: null, end_time: null }
    }

    const startDate = event.start instanceof Date ? event.start : new Date(event.start)
    const endDate = event.end ? (event.end instanceof Date ? event.end : new Date(event.end)) : null

    // Format date as YYYY-MM-DD
    const year = startDate.getFullYear()
    const month = String(startDate.getMonth() + 1).padStart(2, '0')
    const day = String(startDate.getDate()).padStart(2, '0')
    const due_date = `${year}-${month}-${day}`

    // Extract time as HH:mm format
    let start_time: string | null = null
    let end_time: string | null = null

    if (!event.allDay) {
      const startHours = startDate.getHours()
      const startMinutes = startDate.getMinutes()
      start_time = `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`

      if (endDate) {
        const endHours = endDate.getHours()
        const endMinutes = endDate.getMinutes()
        end_time = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
      }
    }

    return { due_date, start_time, end_time }
  }

  const onEventDrop = async (arg: EventDropArg) => {
    const extendedProps = arg.event.extendedProps as any
    
    // Only update tasks, not notes
    if (extendedProps?.type !== 'task') {
      return
    }

    const sourceId = extendedProps?.sourceId
    if (!sourceId || typeof sourceId !== 'number') {
      return
    }

    // Update local state immediately for better UX
    const modifiedEvents = [...events]
    const idx = modifiedEvents.findIndex((e: EventInput) => e.id === arg.event.id)
    if (idx !== -1) {
      modifiedEvents[idx].title = arg.event.title
      modifiedEvents[idx].className = arg.event.classNames
      modifiedEvents[idx].start = arg.event.start as DateInput
      modifiedEvents[idx].end = arg.event.end as DateInput
      setEvents(modifiedEvents)
    }

    try {
      // Extract date and time from the dropped event
      const { due_date, start_time, end_time } = extractDateTimeFromEvent(arg.event)

      // Call API to update task
      const payload: UpdateTaskPayload = {
        id: sourceId,
        due_date,
        start_time,
        end_time,
      }

      const result = await dispatch(updateTask(payload))
      
      if (result.type.endsWith('/fulfilled')) {
        // Refresh events to get updated data
        dispatch(fetchTasks())
        if (params?.currentDate && params?.currentView) {
          await fetchEvents(params.currentDate, params.currentView)
        }
        showNotification({
          message: 'Event updated successfully',
          variant: 'success',
        })
      } else {
        // Revert local state on error
        setEvents(events)
        const errorMsg = result.payload as string || 'Failed to update event'
        showNotification({
          message: errorMsg,
          variant: 'danger',
        })
      }
    } catch (err: any) {
      // Revert local state on error
      setEvents(events)
      const errorMsg = err.message || 'An unexpected error occurred'
      showNotification({
        message: errorMsg,
        variant: 'danger',
      })
    }
    
    setIsEditable(false)
  }

  const onEventResize = async (arg: EventResizeDoneArg) => {
    const extendedProps = arg.event.extendedProps as any
    
    // Only update tasks, not notes
    if (extendedProps?.type !== 'task') {
      return
    }

    const sourceId = extendedProps?.sourceId
    if (!sourceId || typeof sourceId !== 'number') {
      return
    }

    // Update local state immediately for better UX
    const modifiedEvents = [...events]
    const idx = modifiedEvents.findIndex((e: EventInput) => e.id === arg.event.id)
    if (idx !== -1) {
      modifiedEvents[idx].start = arg.event.start as DateInput
      modifiedEvents[idx].end = arg.event.end as DateInput
      setEvents(modifiedEvents)
    }

    try {
      // Extract date and time from the resized event
      const { due_date, start_time, end_time } = extractDateTimeFromEvent(arg.event)

      // Call API to update task
      const payload: UpdateTaskPayload = {
        id: sourceId,
        due_date,
        start_time,
        end_time,
      }

      const result = await dispatch(updateTask(payload))
      
      if (result.type.endsWith('/fulfilled')) {
        // Refresh events to get updated data
        dispatch(fetchTasks())
        if (params?.currentDate && params?.currentView) {
          await fetchEvents(params.currentDate, params.currentView)
        }
        showNotification({
          message: 'Event updated successfully',
          variant: 'success',
        })
      } else {
        // Revert local state on error
        setEvents(events)
        const errorMsg = result.payload as string || 'Failed to update event'
        showNotification({
          message: errorMsg,
          variant: 'danger',
        })
      }
    } catch (err: any) {
      // Revert local state on error
      setEvents(events)
      const errorMsg = err.message || 'An unexpected error occurred'
      showNotification({
        message: errorMsg,
        variant: 'danger',
      })
    }
  }

  const createNewEvent = () => {
    setIsEditable(false)
    onOpenModal()
  }

  return {
    createNewEvent,
    show,
    onDateClick,
    onEventClick,
    onDrop,
    onEventDrop,
    onEventResize,
    events,
    onCloseModal,
    isEditable,
    eventData,
    onUpdateEvent,
    onRemoveEvent,
    onAddEvent,
    loading,
    error,
    fetchEvents,
    dateInfo,
  }
}

export default useCalendar
