
import AddEditModal from '@/views/apps/calendar/components/AddEditModal'
import PageBreadcrumb from '@/components/PageBreadcrumb'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Button, Card, CardBody, Container, Spinner, Alert } from 'react-bootstrap'
import { useSearchParams } from 'react-router'

import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'

import useCalendar from '@/hooks/useCalendar'
import useViewPort from '@/hooks/useViewPort'

import { TbCircleFilled, TbPlus } from 'react-icons/tb'
import SimpleBar from "simplebar-react";
import calendarService, { type ExternalEvent } from './services/calendar.service'
import CreateExternalEventModal from './components/CreateExternalEventModal'

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Single utility to parse date from URL - source of truth
  const parseDateFromUrl = useCallback((dateStr: string | null): Date => {
    if (dateStr) {
      const parsedDate = new Date(dateStr)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }
    // Only fallback to today if URL has no date
    return new Date()
  }, [])

  // Single utility to parse view from URL
  const parseViewFromUrl = useCallback((viewStr: string | null): 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth' => {
    const viewMap: Record<string, 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth'> = {
      month: 'dayGridMonth',
      week: 'timeGridWeek',
      day: 'timeGridDay',
      list: 'listMonth',
    }
    return viewMap[viewStr || ''] || 'dayGridMonth'
  }, [])

  // Format date to YYYY-MM-DD string
  const formatDateToString = useCallback((date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  // Format view to URL string
  const formatViewToString = useCallback((view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth'): string => {
    const viewMap: Record<string, string> = {
      dayGridMonth: 'month',
      timeGridWeek: 'week',
      timeGridDay: 'day',
      listMonth: 'list',
    }
    return viewMap[view] || 'month'
  }, [])

  // Read date and view from URL - single source of truth (computed on every render)
  // Must be defined before useCalendar hook and handleDatesSet callback
  const dateParam = searchParams.get('date')
  const viewParam = searchParams.get('view')
  const urlDate = parseDateFromUrl(dateParam)
  const urlView = parseViewFromUrl(viewParam)

  // Refs for tracking previous state (only for preventing duplicate URL updates)
  const previousViewRef = useRef<string | null>(null)
  const lastHandledDateRef = useRef<string | null>(null)
  const lastHandledViewRef = useRef<string | null>(null)
  const isUpdatingUrlRef = useRef(false)
  const lastUrlDateRef = useRef<string | null>(null)
  const lastUrlViewRef = useRef<string | null>(null)
  const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([])
  const [loadingExternalEvents, setLoadingExternalEvents] = useState(false)
  const [showCreateExternalEventModal, setShowCreateExternalEventModal] = useState(false)

  // Update URL date only (preserve view) - only call on explicit navigation
  // Guarded to prevent duplicate updates
  const updateUrlDate = useCallback((dateStr: string) => {
    // Prevent duplicate updates
    if (lastUrlDateRef.current === dateStr) {
      return
    }
    isUpdatingUrlRef.current = true
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('date', dateStr)
    setSearchParams(newSearchParams, { replace: true })
    lastUrlDateRef.current = dateStr
    setTimeout(() => {
      isUpdatingUrlRef.current = false
    }, 50)
  }, [searchParams, setSearchParams])

  // Update URL view only (preserve date) - only call on view change
  // Guarded to prevent duplicate updates
  const updateUrlView = useCallback((view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth') => {
    const viewStr = formatViewToString(view)
    // Prevent duplicate updates
    if (lastUrlViewRef.current === viewStr) {
      return
    }
    isUpdatingUrlRef.current = true
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('view', viewStr)
    setSearchParams(newSearchParams, { replace: true })
    lastUrlViewRef.current = viewStr
    setTimeout(() => {
      isUpdatingUrlRef.current = false
    }, 50)
  }, [searchParams, setSearchParams, formatViewToString])

  const {
    createNewEvent,
    eventData,
    events,
    isEditable,
    onAddEvent,
    onCloseModal,
    onDateClick,
    onDrop,
    onEventClick,
    onEventDrop,
    onEventResize,
    onRemoveEvent,
    onUpdateEvent,
    show,
    loading,
    error,
  } = useCalendar({ currentDate: urlDate, currentView: urlView })

  const { height } = useViewPort()

  // Calculate next/previous date from URL date and view
  const calculateNavigationDate = useCallback((direction: 'prev' | 'next' | 'today', currentDate: Date, view: string): string => {
    const newDate = new Date(currentDate)
    
    if (direction === 'today') {
      return formatDateToString(new Date())
    }
    
    if (view === 'dayGridMonth' || view === 'listMonth') {
      // Month view: navigate by month
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
    } else if (view === 'timeGridWeek') {
      // Week view: navigate by week
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
    } else if (view === 'timeGridDay') {
      // Day view: navigate by day
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1)
      } else {
        newDate.setDate(newDate.getDate() + 1)
      }
    }
    
    return formatDateToString(newDate)
  }, [formatDateToString])

  // Handle prev/next/today button clicks - calculate from URL only
  const calendarRef = useRef<any>(null)
  
  const handlePrev = useCallback(() => {
    const newDateStr = calculateNavigationDate('prev', urlDate, urlView)
    if (lastUrlDateRef.current !== newDateStr) {
      updateUrlDate(newDateStr)
    }
  }, [urlDate, urlView, calculateNavigationDate, updateUrlDate])

  const handleNext = useCallback(() => {
    const newDateStr = calculateNavigationDate('next', urlDate, urlView)
    if (lastUrlDateRef.current !== newDateStr) {
      updateUrlDate(newDateStr)
    }
  }, [urlDate, urlView, calculateNavigationDate, updateUrlDate])

  const handleToday = useCallback(() => {
    const todayStr = formatDateToString(new Date())
    if (lastUrlDateRef.current !== todayStr) {
      updateUrlDate(todayStr)
    }
  }, [formatDateToString, updateUrlDate])

  // Handle view changes from FullCalendar (only view, never date)
  const handleDatesSet = useCallback((arg: any) => {
    if (!arg.start || !arg.view) return
    
    // Prevent any URL updates during this callback to avoid loops
    if (isUpdatingUrlRef.current) {
      return
    }

    // Map view type
    const viewMap: Record<string, 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth'> = {
      dayGridMonth: 'dayGridMonth',
      timeGridWeek: 'timeGridWeek',
      timeGridDay: 'timeGridDay',
      listMonth: 'listMonth',
    }
    const mappedView = viewMap[arg.view.type] || 'dayGridMonth'
    
    // Read current URL values (single source of truth)
    const currentDateStr = dateParam || formatDateToString(new Date())
    const currentViewStr = viewParam || 'month'
    
    // Initialize refs on first load
    if (previousViewRef.current === null) {
      previousViewRef.current = mappedView
      lastHandledDateRef.current = currentDateStr
      lastHandledViewRef.current = currentViewStr
      lastUrlDateRef.current = currentDateStr
      lastUrlViewRef.current = currentViewStr
      return
    }
    
    // Check if URL has changed externally (browser back/forward, direct navigation)
    const urlDateChanged = lastUrlDateRef.current !== currentDateStr
    const urlViewChanged = lastUrlViewRef.current !== currentViewStr
    
    if (urlDateChanged || urlViewChanged) {
      // URL changed externally - update refs and let the useEffect handle the fetch
      lastUrlDateRef.current = currentDateStr
      lastUrlViewRef.current = currentViewStr
      previousViewRef.current = mappedView
      lastHandledDateRef.current = currentDateStr
      lastHandledViewRef.current = currentViewStr
      return
    }
    
    // Check if view changed (user clicked month/week/day button)
    const viewChanged = previousViewRef.current !== mappedView
    
    if (viewChanged) {
      // View changed: Update URL view only (preserve date)
      const newViewStr = formatViewToString(mappedView)
      previousViewRef.current = mappedView
      lastHandledDateRef.current = currentDateStr
      lastHandledViewRef.current = newViewStr
      
      // Update URL with guard to prevent loops
      if (lastUrlViewRef.current !== newViewStr) {
        updateUrlView(mappedView)
      }
    }
    // DO NOT handle date changes here - prev/next/today are handled by explicit handlers
  }, [updateUrlView, dateParam, viewParam, formatDateToString])

  const externalEventsEle = useRef<HTMLDivElement | null>(null)

  const draggableInstance = useRef<Draggable | null>(null)

  // Fetch external events from API
  const fetchExternalEvents = async () => {
    setLoadingExternalEvents(true)
    try {
      const response = await calendarService.getExternalEvents(false)
      if (response.success && response.data?.externalEvents) {
        setExternalEvents(response.data.externalEvents)
      }
    } catch (error: any) {
      console.error('Failed to fetch external events:', error)
      // Fallback to empty array on error
      setExternalEvents([])
    } finally {
      setLoadingExternalEvents(false)
    }
  }

  useEffect(() => {
    fetchExternalEvents()
  }, [])

  const handleExternalEventCreated = () => {
    // Refresh external events list after creation
    fetchExternalEvents()
  }

  useEffect(() => {
    if (externalEventsEle.current && externalEvents.length > 0) {
      // Store external events data on DOM elements for access during drop
      externalEvents.forEach((event) => {
        const element = externalEventsEle.current?.querySelector(`[data-event-id="${event.id}"]`)
        if (element) {
          (element as any).__externalEventData = event
        }
      })

      draggableInstance.current = new Draggable(externalEventsEle.current, {
        itemSelector: '.external-event',
        eventData: function (eventEl) {
          const eventId = eventEl.getAttribute('data-event-id')
          const externalEvent = externalEvents.find(e => String(e.id) === eventId)
          
          return {
            title: eventEl.innerText,
            classNames: eventEl.getAttribute('data-class'),
            extendedProps: {
              externalEventId: eventId,
              externalEvent: externalEvent,
            },
          }
        },
      })
    }

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.destroy()
      }
    }
  }, [externalEvents])

  return (
    <Container fluid>
      <PageBreadcrumb title="Calendar" subtitle="Apps" />

      <div className="outlook-box gap-1">
        <Card className="h-100 mb-0 d-none d-lg-flex rounded-end-0 overflow-y-auto">
          <CardBody>
            <Button variant="primary" className="w-100 btn-new-event" onClick={createNewEvent}>
              <TbPlus className="me-2 align-middle" />
              Create New Event
            </Button>

            <div ref={externalEventsEle}>
              <p className="text-muted mt-3 fst-italic fs-xs mb-3">Drag and drop your event or click in the calendar</p>
              {loadingExternalEvents ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" className="text-primary" />
                </div>
              ) : externalEvents.length === 0 ? (
                <p className="text-muted text-center py-3 fs-xs">No external events available</p>
              ) : (
                externalEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`external-event fc-event bg-${event.variant}-subtle text-${event.variant} fw-semibold d-flex align-items-center`}
                    data-class={`bg-${event.variant}-subtle text-${event.variant}`}
                    data-event-id={event.id}>
                    <TbCircleFilled className="me-2" />
                    {event.title}
                  </div>
                ))
              )}
            </div>

            <Button 
              variant="outline-primary" 
              className="w-100 mt-3" 
              onClick={() => setShowCreateExternalEventModal(true)}
            >
              <TbPlus className="me-2 align-middle" />
              Add Daily Events
            </Button>
          </CardBody>
        </Card>

        <Card className="h-100 mb-0 rounded-start-0 flex-grow-1 border-start-0">
          <div className="d-lg-none d-inline-flex card-header">
            <Button variant="primary" className="btn-new-event" onClick={createNewEvent}>
              <TbPlus className="me-2 align-middle" />
              Create New Event
            </Button>
          </div>

          <SimpleBar className="card-body" style={{ height: 'calc(100% - 350px)' }} data-simplebar data-simplebar-md>
            {error && (
              <Alert variant="danger" className="m-3">
                {error}
              </Alert>
            )}
            {loading && events.length === 0 && (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" role="status" className="text-primary">
                  <span className="visually-hidden">Loading calendar events...</span>
                </Spinner>
              </div>
            )}
            <FullCalendar
              ref={calendarRef}
              key={`${formatDateToString(urlDate)}-${urlView}`}
              initialDate={urlDate}
              initialView={urlView}
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
              bootstrapFontAwesome={false}
              handleWindowResize={true}
              slotDuration="00:15:00"
              slotLabelInterval="01:00:00"
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }}
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day',
                list: 'List',
                prev: 'Prev',
                next: 'Next',
              }}
              customButtons={{
                prev: {
                  text: 'Prev',
                  click: handlePrev,
                },
                next: {
                  text: 'Next',
                  click: handleNext,
                },
                today: {
                  text: 'Today',
                  click: handleToday,
                },
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
              }}
              height={height - 240}
              editable={true}
              selectable={true}
              droppable={true}
              events={events}
              dateClick={onDateClick}
              eventClick={onEventClick}
              drop={onDrop}
              eventDrop={onEventDrop}
              eventResize={onEventResize}
              datesSet={handleDatesSet}
            />
          </SimpleBar>
        </Card>
      </div>

      <AddEditModal
        eventData={eventData}
        events={events}
        isEditable={isEditable}
        onAddEvent={onAddEvent}
        onRemoveEvent={onRemoveEvent}
        onUpdateEvent={onUpdateEvent}
        open={show}
        toggle={onCloseModal}
      />

      <CreateExternalEventModal
        open={showCreateExternalEventModal}
        toggle={() => setShowCreateExternalEventModal(false)}
        onSuccess={handleExternalEventCreated}
      />
    </Container>
  )
}

export default Index
