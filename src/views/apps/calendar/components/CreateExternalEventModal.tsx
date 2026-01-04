import { useEffect, useState } from 'react'
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
  Spinner,
  FormCheck,
} from 'react-bootstrap'
import Feedback from 'react-bootstrap/Feedback'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import calendarService, { type CreateExternalEventPayload } from '../services/calendar.service'

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

interface CreateExternalEventModalProps {
  open: boolean
  toggle: () => void
  onSuccess?: () => void
}

const CreateExternalEventModal = ({ open, toggle, onSuccess }: CreateExternalEventModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)

  const schema = yup.object({
    title: yup.string().required('Title is required'),
    variant: yup
      .string()
      .oneOf(['primary', 'secondary', 'success', 'danger', 'info', 'warning', 'dark'], 'Invalid variant')
      .optional(),
    description: yup.string().nullable().optional(),
    priority: yup.string().oneOf(['low', 'medium', 'high'], 'Invalid priority').nullable().optional(),
    start_time: yup.string().nullable().optional(),
    end_time: yup.string().nullable().optional(),
    reminder: yup.string().nullable().optional(),
    assigned_to: yup.string().nullable().optional(),
    flagged: yup.boolean().optional(),
  })

  type FormValues = yup.InferType<typeof schema>

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      variant: 'primary',
      description: '',
      priority: null,
      start_time: null,
      end_time: null,
      reminder: null,
      assigned_to: null,
      flagged: false,
    },
  })

  const watchedStartTime = watch('start_time')

  useEffect(() => {
    setSelectedStartTime(watchedStartTime)
    if (!watchedStartTime) {
      setValue('end_time', null)
    }
  }, [watchedStartTime, setValue])

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        variant: 'primary',
        description: '',
        priority: null,
        start_time: null,
        end_time: null,
        reminder: null,
        assigned_to: null,
        flagged: false,
      })
      setError(null)
    }
  }, [open, reset])

  const getEndTimeOptions = (): string[] => {
    if (!selectedStartTime) return TIME_OPTIONS
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }
    const startMinutes = timeToMinutes(selectedStartTime)
    return TIME_OPTIONS.filter((time) => timeToMinutes(time) > startMinutes)
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)

    try {
      const payload: CreateExternalEventPayload = {
        title: data.title,
        variant: (data.variant as 'primary' | 'secondary' | 'success' | 'danger' | 'info' | 'warning' | 'dark') || 'primary',
        description: data.description || null,
        priority: (data.priority as 'low' | 'medium' | 'high' | null) || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        reminder: data.reminder || null,
        assigned_to: data.assigned_to || null,
        flagged: data.flagged || false,
      }

      const response = await calendarService.createExternalEvent(payload, false)
      if (response.success) {
        toggle()
        onSuccess?.()
      } else {
        setError(response.msg || 'Failed to create external event')
      }
    } catch (err: any) {
      console.error('Failed to create external event:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={open} onHide={toggle} centered size="lg">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle as="h4">Add Daily Event</ModalTitle>
          <button type="button" className="btn-close" onClick={toggle} disabled={loading}></button>
        </ModalHeader>
        <ModalBody>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Row>
            <Col sm={12}>
              <FormGroup className="mb-3">
                <FormLabel>
                  Title <span className="text-danger">*</span>
                </FormLabel>
                <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormControl
                        {...field}
                        type="text"
                        placeholder="Enter event title"
                        isInvalid={!!fieldState.error}
                        disabled={loading}
                      />
                      {fieldState.error && <Feedback type="invalid">{fieldState.error.message}</Feedback>}
                    </>
                  )}
                />
              </FormGroup>
            </Col>
            <Col sm={12}>
              <FormGroup className="mb-3">
                <FormLabel>Description</FormLabel>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormControl
                        {...field}
                        as="textarea"
                        rows={3}
                        placeholder="Enter event description"
                        isInvalid={!!fieldState.error}
                        disabled={loading}
                        value={field.value || ''}
                      />
                      {fieldState.error && <Feedback type="invalid">{fieldState.error.message}</Feedback>}
                    </>
                  )}
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Variant</FormLabel>
                <Controller
                  name="variant"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormSelect {...field} isInvalid={!!fieldState.error} disabled={loading}>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="success">Success</option>
                        <option value="danger">Danger</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="dark">Dark</option>
                      </FormSelect>
                      {fieldState.error && <Feedback type="invalid">{fieldState.error.message}</Feedback>}
                    </>
                  )}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Priority</FormLabel>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <FormSelect {...field} isInvalid={!!fieldState.error} disabled={loading} value={field.value || ''}>
                        <option value="">Select priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </FormSelect>
                      {fieldState.error && <Feedback type="invalid">{fieldState.error.message}</Feedback>}
                    </>
                  )}
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <FormGroup className="mb-3">
                <FormLabel>Start Time</FormLabel>
                <Controller
                  name="start_time"
                  control={control}
                  render={({ field }) => (
                    <FormSelect {...field} disabled={loading} value={field.value || ''}>
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
                  render={({ field, fieldState }) => (
                    <>
                      <FormSelect
                        {...field}
                        disabled={loading || !selectedStartTime}
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
                      {fieldState.error && <Feedback type="invalid">{fieldState.error.message}</Feedback>}
                    </>
                  )}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup className="mb-3">
                <FormLabel>Reminder</FormLabel>
                <Controller
                  name="reminder"
                  control={control}
                  render={({ field }) => (
                    <FormSelect {...field} disabled={loading} value={field.value || ''}>
                      <option value="">Select reminder time</option>
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
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Assigned To</FormLabel>
                <Controller
                  name="assigned_to"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      {...field}
                      type="text"
                      placeholder="User ID or email"
                      disabled={loading}
                      value={field.value || ''}
                    />
                  )}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-3">
                <FormLabel>Flagged</FormLabel>
                <div>
                  <Controller
                    name="flagged"
                    control={control}
                    render={({ field }) => (
                      <FormCheck
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={loading}
                        label="Flag this event"
                      />
                    )}
                  />
                </div>
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" type="button" onClick={toggle} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  )
}

export default CreateExternalEventModal

