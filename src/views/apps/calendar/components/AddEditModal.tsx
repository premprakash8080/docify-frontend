import type {CalendarFormType} from '@/types/calendar'
import {yupResolver} from '@hookform/resolvers/yup'
import {useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useNotificationContext} from '@/context/useNotificationContext'
import type {EventInput} from '@fullcalendar/core'
import {
    Button,
    Col,
    Form,
    FormControl,
    FormGroup,
    FormLabel,
    FormSelect,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    Row,
    Alert,
    Spinner
} from 'react-bootstrap'
import Feedback from 'react-bootstrap/Feedback'
import {Controller, useForm} from 'react-hook-form'
import * as yup from 'yup'
import {createTask, updateTask, deleteTask, fetchTasks} from '@/views/tasks/store/tasksSlice'
import httpService from '@/core/http'
import type {AppDispatch} from '@/store/types'
import type {CreateTaskPayload, UpdateTaskPayload} from '@/views/tasks/types'
import calendarService from '../services/calendar.service'

// Generate time options in 30-minute intervals from 7:00 AM to 9:00 PM
const generateTimeOptions = (): string[] => {
  const options: string[] = []
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 21 && minute > 0) break
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push(timeString)
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

const AddEditModal = ({
                          eventData,
                          events = [],
                          isEditable,
                          onAddEvent,
                          onRemoveEvent,
                          onUpdateEvent,
                          open,
                          toggle
                      }: CalendarFormType) => {
    const dispatch: AppDispatch = useDispatch()
    const {showNotification} = useNotificationContext()
    const [loading, setLoading] = useState(false)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)
    const [fetchedData, setFetchedData] = useState<any>(null)

    const schema = yup.object({
        label: yup.string().required('Task name is required'),
        description: yup.string().required('Task description is required'),
        due_date: yup.string().nullable().optional(),
        start_time: yup.string().nullable().optional(),
        end_time: yup.string().nullable().optional(),
        priority: yup.string().oneOf(['low', 'medium', 'high'], 'Invalid priority').nullable().optional(),
    })

    type FormValues = yup.InferType<typeof schema>

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: {errors},
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            label: '',
            description: '',
            due_date: null,
            start_time: null,
            end_time: null,
            priority: null,
        },
    })

    const watchedStartTime = watch('start_time')

    useEffect(() => {
        setSelectedStartTime(watchedStartTime)
        if (!watchedStartTime) {
            setValue('end_time', null)
        }
    }, [watchedStartTime, setValue])

    // Fetch event details when modal opens with an event
    useEffect(() => {
        const fetchEventDetails = async () => {
            if (open && eventData && isEditable) {
                const props = eventData.extendedProps as any
                const eventType = props?.type // 'task' or 'note'
                const sourceId = props?.sourceId // ID to fetch
                
                // Only fetch if we have type and sourceId
                if (eventType && sourceId) {
                    setLoadingDetails(true)
                    setError(null)
                    setFetchedData(null)
                    
                    try {
                        if (eventType === 'task') {
                            // Fetch task details
                            const response = await calendarService.getTaskById(sourceId, false)
                            if (response.success && response.data?.task) {
                                const task = response.data.task
                                setFetchedData(task)
                                
                                // Extract date from due_date or start_date
                                let dueDate = null
                                if (task.due_date) {
                                    dueDate = task.due_date.includes('T') 
                                        ? task.due_date.split('T')[0] 
                                        : task.due_date
                                } else if (task.start_date) {
                                    dueDate = task.start_date.includes('T') 
                                        ? task.start_date.split('T')[0] 
                                        : task.start_date
                                } else if (eventData.start) {
                                    const startDate = new Date(eventData.start as Date)
                                    dueDate = startDate.toISOString().split('T')[0]
                                }
                                
                                // Extract time from start_time, end_time if they're ISO strings
                                let startTime = null
                                let endTime = null
                                if (task.start_time) {
                                    if (task.start_time.includes('T')) {
                                        const timePart = task.start_time.split('T')[1]
                                        startTime = timePart ? timePart.split(':').slice(0, 2).join(':') : null
                                    } else {
                                        startTime = task.start_time.split(':').slice(0, 2).join(':')
                                    }
                                }
                                if (task.end_time) {
                                    if (task.end_time.includes('T')) {
                                        const timePart = task.end_time.split('T')[1]
                                        endTime = timePart ? timePart.split(':').slice(0, 2).join(':') : null
                                    } else {
                                        endTime = task.end_time.split(':').slice(0, 2).join(':')
                                    }
                                }
                                
                                reset({
                                    label: task.label || eventData.title || '',
                                    description: task.description || '',
                                    due_date: dueDate,
                                    start_time: startTime,
                                    end_time: endTime,
                                    priority: task.priority || null,
                                })
                                setSelectedStartTime(startTime)
                            } else {
                                setError('Failed to fetch task details')
                            }
                        } else if (eventType === 'note') {
                            // Fetch note details
                            const response = await calendarService.getNoteById(sourceId as string, false)
                            if (response.success && response.data?.note) {
                                const note = response.data.note
                                setFetchedData(note)
                                
                                // For notes, we'll show a simplified view
                                // Extract date from event start if available
                                let dueDate = null
                                if (eventData.start) {
                                    const startDate = new Date(eventData.start as Date)
                                    dueDate = startDate.toISOString().split('T')[0]
                                }
                                
                                reset({
                                    label: note.title || eventData.title || '',
                                    description: typeof note.content === 'string' 
                                        ? note.content 
                                        : (note.content as any)?.content || '',
                                    due_date: dueDate,
                                    start_time: null,
                                    end_time: null,
                                    priority: null,
                                })
                            } else {
                                setError('Failed to fetch note details')
                            }
                        }
                    } catch (err: any) {
                        console.error('Failed to fetch event details:', err)
                        setError(err.message || 'Failed to fetch event details')
                    } finally {
                        setLoadingDetails(false)
                    }
                } else {
                    // No type/sourceId, use existing logic for external events or new events
                    const props = eventData.extendedProps as any
                    const isExternalDrop = props?.isExternalDrop && !isEditable
                    
                    if (isExternalDrop && props) {
                        // External event dropped - use pre-calculated drop data
                        const dropDate = props.dropDate || (eventData.start ? new Date(eventData.start as Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
                        const startTime = props.dropStartTime || null
                        const endTime = props.dropEndTime || null
                        const externalEvent = props.externalEvent || {}

                        reset({
                            label: eventData.title || externalEvent.title || '',
                            description: externalEvent.description || '',
                            due_date: dropDate,
                            start_time: startTime,
                            end_time: endTime,
                            priority: externalEvent.priority || null,
                        })
                        setSelectedStartTime(startTime)
                    } else {
                        // New event - use current date if available
                        const today = new Date().toISOString().split('T')[0]
                        reset({
                            label: '',
                            description: '',
                            due_date: today,
                            start_time: null,
                            end_time: null,
                            priority: null,
                        })
                    }
                    setFetchedData(null)
                }
            } else if (open && !eventData) {
                // New event - reset form
                const today = new Date().toISOString().split('T')[0]
                reset({
                    label: '',
                    description: '',
                    due_date: today,
                    start_time: null,
                    end_time: null,
                    priority: null,
                })
                setFetchedData(null)
                setError(null)
            }
        }
        
        fetchEventDetails()
    }, [open, eventData, isEditable, reset])

    const getEndTimeOptions = (): string[] => {
        if (!selectedStartTime) return TIME_OPTIONS
        const timeToMinutes = (time: string): number => {
            const [hours, minutes] = time.split(':').map(Number)
            return hours * 60 + minutes
        }
        const startMinutes = timeToMinutes(selectedStartTime)
        return TIME_OPTIONS.filter((time) => timeToMinutes(time) > startMinutes)
    }

    const onSubmitEvent = async (data: FormValues) => {
        setLoading(true)
        setError(null)

        try {
            if (isEditable && eventData?.extendedProps) {
                const props = eventData.extendedProps as any
                const sourceId = props.sourceId

                if (props.type === 'task' && typeof sourceId === 'number') {
                    // Update task
                    const payload: UpdateTaskPayload = {
                        id: sourceId,
                        label: data.label,
                        description: data.description || null,
                        due_date: data.due_date || null,
                        start_time: data.start_time || null,
                        end_time: data.end_time || null,
                        priority: (data.priority as 'low' | 'medium' | 'high' | null) || null,
                    }

                    const result = await dispatch(updateTask(payload))
                    if (result.type.endsWith('/fulfilled')) {
                        dispatch(fetchTasks())
                        onUpdateEvent()
                    } else {
                        const errorMsg = result.payload as string || 'Failed to update task'
                        setError(errorMsg)
                        showNotification({
                            message: errorMsg,
                            variant: 'danger',
                        })
                    }
                }
            } else {
                // Create new task
                const payload: CreateTaskPayload = {
                    label: data.label,
                    description: data.description || null,
                    due_date: data.due_date || null,
                    start_time: data.start_time || null,
                    end_time: data.end_time || null,
                    priority: (data.priority as 'low' | 'medium' | 'high' | null) || null,
                    flagged: false,
                    completed: false,
                }

                const result = await dispatch(createTask(payload))
                if (result.type.endsWith('/fulfilled')) {
                    dispatch(fetchTasks())
                    onAddEvent()
                } else {
                    const errorMsg = result.payload as string || 'Failed to create task'
                    setError(errorMsg)
                    showNotification({
                        message: errorMsg,
                        variant: 'danger',
                    })
                }
            }
        } catch (err: any) {
            const errorMsg = err.message || 'An unexpected error occurred'
            setError(errorMsg)
            showNotification({
                message: errorMsg,
                variant: 'danger',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!isEditable || !eventData?.extendedProps) return

        const props = eventData.extendedProps as any
        const sourceId = props.sourceId

        if (props.type === 'task' && typeof sourceId === 'number') {
            setLoading(true)
            setError(null)

            try {
                const result = await dispatch(deleteTask({ id: sourceId }))
                if (result.type.endsWith('/fulfilled')) {
                    dispatch(fetchTasks())
                    onRemoveEvent()
                } else {
                    setError(result.payload as string || 'Failed to delete task')
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Modal show={open} onHide={toggle} centered size="lg">
            <Form onSubmit={handleSubmit(onSubmitEvent)}>
                <ModalHeader>
                    <ModalTitle as="h4">
                        {isEditable 
                            ? (fetchedData && (eventData?.extendedProps as any)?.type === 'note' ? 'View Note' : 'Edit Task')
                            : 'Create Task'
                        }
                    </ModalTitle>
                    <button type="button" className="btn-close" onClick={toggle} disabled={loading || loadingDetails}></button>
                </ModalHeader>
                <ModalBody>
                    {loadingDetails && (
                        <div className="d-flex justify-content-center align-items-center py-4">
                            <Spinner animation="border" role="status" className="text-primary">
                                <span className="visually-hidden">Loading event details...</span>
                            </Spinner>
                            <span className="ms-2">Loading event details...</span>
                        </div>
                    )}
                    {error && !loadingDetails && (
                        <Alert variant="danger" className="mb-3">
                            {error}
                        </Alert>
                    )}

                    {!loadingDetails && (
                        <>
                            <Row>
                                <Col sm={12}>
                                    <FormGroup className="mb-3">
                                        <FormLabel>
                                            {fetchedData && (eventData?.extendedProps as any)?.type === 'note' ? 'Note Title' : 'Task Name'} <span className="text-danger">*</span>
                                        </FormLabel>
                                <Controller
                                    name="label"
                                    control={control}
                                    render={({field, fieldState}) => (
                                        <>
                                            <FormControl
                                                {...field}
                                                type="text"
                                                placeholder={fetchedData && (eventData?.extendedProps as any)?.type === 'note' ? "Enter note title" : "Enter task name"}
                                                isInvalid={!!fieldState.error}
                                                disabled={loading || loadingDetails || (fetchedData && (eventData?.extendedProps as any)?.type === 'note')}
                                            />
                                            {fieldState.error && (
                                                <Feedback type="invalid">{fieldState.error.message}</Feedback>
                                            )}
                                        </>
                                    )}
                                />
                            </FormGroup>
                        </Col>
                                <Col sm={12}>
                                    <FormGroup className="mb-3">
                                        <FormLabel>
                                            {fetchedData && (eventData?.extendedProps as any)?.type === 'note' ? 'Note Content' : 'Task Description'} <span className="text-danger">*</span>
                                        </FormLabel>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({field, fieldState}) => (
                                                <>
                                                    <FormControl
                                                        {...field}
                                                        as="textarea"
                                                        rows={fetchedData && (eventData?.extendedProps as any)?.type === 'note' ? 6 : 3}
                                                        placeholder={fetchedData && (eventData?.extendedProps as any)?.type === 'note' ? "Enter note content" : "Enter task description"}
                                                        isInvalid={!!fieldState.error}
                                                        disabled={loading || loadingDetails}
                                                        value={field.value || ''}
                                                    />
                                                    {fieldState.error && (
                                                        <Feedback type="invalid">{fieldState.error.message}</Feedback>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            {fetchedData && (eventData?.extendedProps as any)?.type === 'note' ? (
                                // Note-specific fields (read-only metadata display)
                                <Row>
                                    <Col md={6}>
                                        <FormGroup className="mb-3">
                                            <FormLabel>Notebook</FormLabel>
                                            <FormControl
                                                type="text"
                                                value={fetchedData.notebook_name || 'No notebook' || ''}
                                                disabled={true}
                                                readOnly
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup className="mb-3">
                                            <FormLabel>Stack</FormLabel>
                                            <FormControl
                                                type="text"
                                                value={fetchedData.stack_name || 'No stack' || ''}
                                                disabled={true}
                                                readOnly
                                            />
                                        </FormGroup>
                                    </Col>
                                    {fetchedData.tags && fetchedData.tags.length > 0 && (
                                        <Col sm={12}>
                                            <FormGroup className="mb-3">
                                                <FormLabel>Tags</FormLabel>
                                                <div>
                                                    {fetchedData.tags.map((tag: any) => (
                                                        <span key={tag.id} className="badge bg-primary me-2">
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                    )}
                                </Row>
                            ) : (
                                // Task-specific fields
                                <>
                                    <Row>
                                        <Col md={4}>
                                            <FormGroup className="mb-3">
                                                <FormLabel>Due Date</FormLabel>
                                                <Controller
                                                    name="due_date"
                                                    control={control}
                                                    render={({field}) => (
                                                        <FormControl
                                                            {...field}
                                                            type="date"
                                                            disabled={loading || loadingDetails}
                                                            value={field.value || ''}
                                                        />
                                                    )}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup className="mb-3">
                                                <FormLabel>Start Time</FormLabel>
                                                <Controller
                                                    name="start_time"
                                                    control={control}
                                                    render={({field}) => (
                                                        <FormSelect
                                                            {...field}
                                                            disabled={loading || loadingDetails}
                                                            value={field.value || ''}
                                                        >
                                                            <option value="">Select start time</option>
                                                            {TIME_OPTIONS.map((time) => (
                                                                <option key={time} value={time}>
                                                                    {formatTimeDisplay(time)}
                                                                </option>
                                                            ))}
                                                        </FormSelect>
                                                    )}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={4}>
                                            <FormGroup className="mb-3">
                                                <FormLabel>End Time</FormLabel>
                                                <Controller
                                                    name="end_time"
                                                    control={control}
                                                    render={({field, fieldState}) => (
                                                        <>
                                                            <FormSelect
                                                                {...field}
                                                                disabled={loading || loadingDetails || !selectedStartTime}
                                                                value={field.value || ''}
                                                                isInvalid={!!fieldState.error}
                                                            >
                                                                <option value="">Select end time</option>
                                                                {getEndTimeOptions().map((time) => (
                                                                    <option key={time} value={time}>
                                                                        {formatTimeDisplay(time)}
                                                                    </option>
                                                                ))}
                                                            </FormSelect>
                                                            {fieldState.error && (
                                                                <Feedback type="invalid">{fieldState.error.message}</Feedback>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <FormGroup className="mb-3">
                                                <FormLabel>Priority</FormLabel>
                                                <Controller
                                                    name="priority"
                                                    control={control}
                                                    render={({field, fieldState}) => (
                                                        <>
                                                            <FormSelect
                                                                {...field}
                                                                isInvalid={!!fieldState.error}
                                                                disabled={loading || loadingDetails}
                                                                value={field.value || ''}
                                                            >
                                                                <option value="">Select priority</option>
                                                                <option value="low">Low</option>
                                                                <option value="medium">Medium</option>
                                                                <option value="high">High</option>
                                                            </FormSelect>
                                                            {fieldState.error && (
                                                                <Feedback type="invalid">{fieldState.error.message}</Feedback>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    {isEditable && (eventData?.extendedProps as any)?.type === 'task' && (
                        <Button variant="danger" type="button" onClick={handleDelete} disabled={loading || loadingDetails}>
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    )}
                    <Button variant="light" type="button" onClick={toggle} disabled={loading || loadingDetails}>
                        Close
                    </Button>
                    {(eventData?.extendedProps as any)?.type !== 'note' && (
                        <Button variant="primary" type="submit" disabled={loading || loadingDetails}>
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    {isEditable ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                isEditable ? 'Update' : 'Create'
                            )}
                        </Button>
                    )}
                </ModalFooter>
            </Form>
        </Modal>
    )
}

export default AddEditModal
